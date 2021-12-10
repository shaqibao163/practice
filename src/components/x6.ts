/*
 * @Description:
 * @Version: 1.0
 * @Author: bclz
 * @Date: 2021-12-10 09:05:24
 * @LastEditors: bclz
 * @LastEditTime: 2021-12-10 17:19:57
 */

import { Graph, Shape, Addon, ToolsView, Point, EdgeView } from "@antv/x6";
import pipelineCross from "../images/pipeline-cross.svg"; // 交叉管道
import pipelineRevolve from "../images/pipeline-revolve.svg"; // 旋转管道
import pipelineTransverse from "../images/pipeline-transverse.svg"; // 横向管道

// 注册文本编辑原件
class EditableCellTool extends ToolsView.ToolItem<
  EdgeView,
  EditableCellToolOptions
> {
  private editorContent: any;

  render() {
    super.render();
    const cell = this.cell;
    let x = 0;
    let y = 0;
    let width = 0;
    let height = 0;

    if (cell.isNode()) {
      const position = cell.position();
      const size = cell.size();
      const pos = this.graph.localToGraph(position);
      const zoom = this.graph.zoom();
      x = pos.x;
      y = pos.y;
      width = size.width * zoom;
      height = size.height * zoom;
    } else {
      x = this.options.x - 40;
      y = this.options.y - 20;
      width = 80;
      height = 40;
    }

    const editorParent = ToolsView.createElement(
      "div",
      false
    ) as HTMLDivElement;
    editorParent.style.position = "absolute";
    editorParent.style.left = `${x}px`;
    editorParent.style.top = `${y}px`;
    editorParent.style.width = `${width}px`;
    editorParent.style.height = `${height}px`;
    editorParent.style.display = "flex";
    editorParent.style.alignItems = "center";
    editorParent.style.textAlign = "center";

    this.editorContent = ToolsView.createElement(
      "div",
      false
    ) as HTMLDivElement;
    this.editorContent.contentEditable = "true";
    this.editorContent.style.width = "100%";
    this.editorContent.style.outline = "none";
    this.editorContent.style.backgroundColor = cell.isEdge() ? "#fff" : "";
    this.editorContent.style.border = cell.isEdge() ? "1px solid #ccc" : "none";
    editorParent.appendChild(this.editorContent);
    this.container.appendChild(editorParent);

    this.init();

    return this;
  }

  init = () => {
    const cell = this.cell;
    if (cell.isNode()) {
      const value = cell.attr("text/textWrap/text") as string;
      if (value) {
        this.editorContent.innerText = value;
        cell.attr("text/style/display", "none");
      }
    }
    setTimeout(() => {
      this.editorContent.focus();
    });
    document.addEventListener("mousedown", this.onMouseDown);
  };

  onMouseDown = (e: MouseEvent) => {
    if (e.target !== this.editorContent) {
      const cell = this.cell;
      const value = this.editorContent.innerText;
      cell.removeTools();
      if (cell.isNode()) {
        cell.attr("text/textWrap/text", value);
        cell.attr("text/style/display", "");
      } else if (cell.isEdge()) {
        cell.appendLabel({
          attrs: {
            text: {
              text: value,
            },
          },
          position: {
            distance: this.getDistance(),
          },
        });
      }
      document.removeEventListener("mousedown", this.onMouseDown);
    }
  };

  getDistance() {
    const cell = this.cell;
    if (cell.isEdge()) {
      const targetPoint = cell.getTargetPoint();
      const cross = cell
        .getSourceNode()!
        .getBBox()
        .intersectsWithLineFromCenterToPoint(targetPoint)!;
      const p = new Point(this.options.x, this.options.y);
      return p.distance(cross);
    }
    return 0;
  }
}

EditableCellTool.config({
  tagName: "div",
  isSVGElement: false,
});

export interface EditableCellToolOptions extends ToolsView.ToolItem.Options {
  x: number;
  y: number;
}

// 创建画布
const initializeX6Graph = () => {
  Graph.registerNodeTool("editableCell", EditableCellTool, true);
  return new Graph({
    container: document.getElementById("graph-container")!,
    grid: true,
    history: true,
    mousewheel: {
      enabled: true,
      zoomAtMousePosition: true,
      modifiers: "ctrl",
      minScale: 0.5,
      maxScale: 3,
    },
    connecting: {
      router: "manhattan",
      connector: {
        name: "rounded",
        args: {
          radius: 8,
        },
      },
      anchor: "center",
      connectionPoint: "anchor",
      allowBlank: false,
      snap: {
        radius: 20,
      },
      createEdge() {
        return new Shape.Edge({
          attrs: {
            line: {
              stroke: "#A2B1C3",
              strokeWidth: 2,
              targetMarker: {
                name: "block",
                width: 12,
                height: 8,
              },
            },
          },
          zIndex: 0,
        });
      },
      validateConnection({ targetMagnet }) {
        return !!targetMagnet;
      },
    },
    highlighting: {
      magnetAdsorbed: {
        name: "stroke",
        args: {
          attrs: {
            fill: "#5F95FF",
            stroke: "#5F95FF",
          },
        },
      },
    },
    resizing: true,
    rotating: true,
    selecting: {
      enabled: true,
      rubberband: true,
      showNodeSelectionBox: true,
    },
    snapline: true,
    keyboard: true,
    clipboard: true,
  });
};

// 创建左侧工具栏
const initializeStencil = (graph: any) => {
  const stencil = new Addon.Stencil({
    title: "流程图",
    target: graph,
    stencilGraphWidth: 280,
    stencilGraphHeight: 180,
    collapsable: true,
    groups: [
      {
        title: "系统原件",
        name: "group1",
      },
      {
        title: "我的原件",
        name: "group2",
        graphHeight: 250,
        layoutOptions: {
          rowHeight: 70,
        },
      },
    ],
    layoutOptions: {
      columns: 3,
      columnWidth: 85,
      rowHeight: 55,
    },
  });
  document.getElementById("stencil")!.appendChild(stencil.container);
  return stencil;
};

// 初始化鼠标/键盘事件
const initializeMouseEvent = (graph: any) => {
  // 复制
  graph.bindKey(["meta+c", "ctrl+c"], () => {
    const cells = graph.getSelectedCells();
    if (cells.length) {
      graph.copy(cells);
    }
    return false;
  });

  // 剪切
  graph.bindKey(["meta+x", "ctrl+x"], () => {
    const cells = graph.getSelectedCells();
    if (cells.length) {
      graph.cut(cells);
    }
    return false;
  });

  // 粘贴
  graph.bindKey(["meta+v", "ctrl+v"], () => {
    if (!graph.isClipboardEmpty()) {
      const cells = graph.paste({ offset: 32 });
      graph.cleanSelection();
      graph.select(cells);
    }
    return false;
  });

  // 撤销动作
  graph.bindKey(["meta+z", "ctrl+z"], () => {
    if (graph.history.canUndo()) {
      graph.history.undo();
    }
    return false;
  });

  // 重做
  //   graph.bindKey(["meta+shift+z", "ctrl+shift+z"], () => {
  //     if (graph.history.canRedo()) {
  //       graph.history.redo();
  //     }
  //     return false;
  //   });

  // select all
  graph.bindKey(["meta+a", "ctrl+a"], () => {
    const nodes = graph.getNodes();
    if (nodes) {
      graph.select(nodes);
    }
  });

  //delete
  graph.bindKey("delete", () => {
    const cells = graph.getSelectedCells();
    if (cells.length) {
      graph.removeCells(cells);
    }
  });

  // zoom
  graph.bindKey(["ctrl+1", "meta+1"], () => {
    const zoom = graph.zoom();
    if (zoom < 1.5) {
      graph.zoom(0.1);
    }
  });
  graph.bindKey(["ctrl+2", "meta+2"], () => {
    const zoom = graph.zoom();
    if (zoom > 0.5) {
      graph.zoom(-0.1);
    }
  });

  graph.on("cell:dblclick", (data: any) => {
    const { cell, e } = data;
    const p = graph.clientToGraph(e.clientX, e.clientY);
    cell.addTools([
      {
        name: "editableCell",
        args: {
          x: p.x,
          y: p.y,
        },
      },
    ]);
  });
};

// 渲染画布
export const getX6Render = () => {
  const graph: any = initializeX6Graph();

  const stencil: any = initializeStencil(graph);

  initializeMouseEvent(graph);

  // 可编辑文本元件
  const textNode = graph.createNode({
    width: 100,
    height: 40,
    data: {
      typeName: "文本",
      type: "textNode",
      name: "元件名称",
    },
    attrs: {
      body: {
        stroke: "rgba(0,0,0,0.2)",
        fill: "transparent",
        strokeWidth: 1,
      },
      text: {
        textWrap: {
          text: "文本原件",
          width: -10,
        },
      },
    },
  });

  stencil.load([textNode], "group1");

  const imageShapes = [
    {
      label: "self",
      image: pipelineCross,
      data: {
        typeName: "图片",
        type: "imgNode",
        name: "交叉管道",
      },
    },
    {
      label: "self",
      image: pipelineRevolve,
      data: {
        typeName: "图片",
        type: "imgNode",
        name: "旋转管道",
      },
    },
    {
      label: "self",
      image: pipelineTransverse,
      data: {
        typeName: "图片",
        type: "imgNode",
        name: "横向管道",
      },
    },
  ];

  Graph.registerNode(
    "custom-image",
    {
      inherit: "rect",
      width: 52,
      height: 52,
      markup: [
        {
          tagName: "image",
          selector: "body",
        },
      ],
      attrs: {
        body: {
          stroke: "#5F95FF",
          fill: "#5F95FF",
        },
      },
    },
    true
  );

  const imageNodes = imageShapes.map((item) =>
    graph.createNode({
      shape: "custom-image",
      //   label: item.label,
      data: item.data,
      attrs: {
        image: {
          "xlink:href": item.image,
        },
      },
    })
  );
  stencil.load(imageNodes, "group2");
  return graph;
};
