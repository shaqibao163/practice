/*
 * @Description: 
 * @Version: 1.0
 * @Author: bclz
 * @Date: 2021-12-01 15:11:59
 * @LastEditors: bclz
 * @LastEditTime: 2021-12-03 10:07:03
 */
import React, { Component } from 'react';
import { Button, Form, Input } from 'antd'
import { Graph, Shape, Addon } from '@antv/x6'
import pipelineCross from './images/pipeline-cross.svg'               // 交叉管道
import pipelineRevolve from './images/pipeline-revolve.svg'             // 旋转管道
import pipelineTransverse from './images/pipeline-transverse.svg'    // 横向管道
// import graphData from './mock/appData'
import './App.css';

interface IState {
  cell: any
  graphView: any
  graphData: any[]
  isPreview: boolean
}
export default class App extends Component<any, IState> {
  formRef: any = React.createRef()
  state = {
    cell: { getAttrs: () => { }, setAttrs: (a: any) => { } },
    graphView: { toJSON: () => { }, dispose: () => { }, on: (a: string, e: any) => { }, getCellById: (a: string) => { } },
    graphData: [],
    isPreview: false,
  }

  // 初始化
  initializeView = () => {
    // 初始化画布
    const graph = new Graph({
      container: document.getElementById('graph-container')!,
      grid: true,
      mousewheel: {
        enabled: true,
        zoomAtMousePosition: true,
        modifiers: 'ctrl',
        minScale: 0.5,
        maxScale: 3,
      },
      connecting: {
        router: 'manhattan',
        connector: {
          name: 'rounded',
          args: {
            radius: 8,
          },
        },
        anchor: 'center',
        connectionPoint: 'anchor',
        allowBlank: false,
        snap: {
          radius: 20,
        },
        createEdge() {
          return new Shape.Edge({
            attrs: {
              line: {
                stroke: '#A2B1C3',
                strokeWidth: 2,
                targetMarker: {
                  name: 'block',
                  width: 12,
                  height: 8,
                },
              },
            },
            zIndex: 0,
          })
        },
        validateConnection({ targetMagnet }) {
          return !!targetMagnet
        },
      },
      highlighting: {
        magnetAdsorbed: {
          name: 'stroke',
          args: {
            attrs: {
              fill: '#5F95FF',
              stroke: '#5F95FF',
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
    })
    // 初始化左侧图例工具栏
    const stencil = new Addon.Stencil({
      title: '流程图',
      target: graph,
      stencilGraphWidth: 200,
      stencilGraphHeight: 180,
      collapsable: true,
      groups: [
        {
          title: '基础流程图',
          name: 'group1',
        },
        {
          title: '系统设计图',
          name: 'group2',
          graphHeight: 250,
          layoutOptions: {
            rowHeight: 70,
          },
        },
      ],
      layoutOptions: {
        columns: 2,
        columnWidth: 80,
        rowHeight: 55,
      },
    })
    document.getElementById('stencil')!.appendChild(stencil.container)

    graph.bindKey(['meta+c', 'ctrl+c'], () => {
      const cells = graph.getSelectedCells()
      if (cells.length) {
        graph.copy(cells)
      }
      return false
    })
    graph.bindKey(['meta+x', 'ctrl+x'], () => {
      const cells = graph.getSelectedCells()
      if (cells.length) {
        graph.cut(cells)
      }
      return false
    })
    graph.bindKey(['meta+v', 'ctrl+v'], () => {
      if (!graph.isClipboardEmpty()) {
        const cells = graph.paste({ offset: 32 })
        graph.cleanSelection()
        graph.select(cells)
      }
      return false
    })

    //undo redo
    graph.bindKey(['meta+z', 'ctrl+z'], () => {
      if (graph.history.canUndo()) {
        graph.history.undo()
      }
      return false
    })
    graph.bindKey(['meta+shift+z', 'ctrl+shift+z'], () => {
      if (graph.history.canRedo()) {
        graph.history.redo()
      }
      return false
    })

    // select all
    graph.bindKey(['meta+a', 'ctrl+a'], () => {
      const nodes = graph.getNodes()
      if (nodes) {
        graph.select(nodes)
      }
    })

    //delete
    graph.bindKey('backspace', () => {
      const cells = graph.getSelectedCells()
      if (cells.length) {
        graph.removeCells(cells)
      }
    })

    // zoom
    graph.bindKey(['ctrl+1', 'meta+1'], () => {
      const zoom = graph.zoom()
      if (zoom < 1.5) {
        graph.zoom(0.1)
      }
    })
    graph.bindKey(['ctrl+2', 'meta+2'], () => {
      const zoom = graph.zoom()
      if (zoom > 0.5) {
        graph.zoom(-0.1)
      }
    })

    const ports = {
      groups: {
        top: {
          position: 'top',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'hidden',
              },
            },
          },
        },
        right: {
          position: 'right',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'hidden',
              },
            },
          },
        },
        bottom: {
          position: 'bottom',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'hidden',
              },
            },
          },
        },
        left: {
          position: 'left',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'hidden',
              },
            },
          },
        },
      },
      items: [
        {
          group: 'top',
        },
        {
          group: 'right',
        },
        {
          group: 'bottom',
        },
        {
          group: 'left',
        },
      ],
    }
    // Graph.registerNode(
    //   'custom-rect',
    //   {
    //     inherit: 'rect',
    //     width: 66,
    //     height: 36,
    //     attrs: {
    //       body: {
    //         strokeWidth: 1,
    //         stroke: '#5F95FF',
    //         fill: '#EFF4FF',
    //       },
    //       text: {
    //         fontSize: 12,
    //         fill: '#262626',
    //       },
    //     },
    //     ports: { ...ports },
    //   },
    //   true,
    // )


    Graph.registerNode(
      'custom-image',
      {
        inherit: 'rect',
        width: 52,
        height: 52,
        markup: [
          {
            tagName: 'image',
            selector: 'body',
          },
        ],
        attrs: {
          body: {
            stroke: '#5F95FF',
            fill: '#5F95FF',
          },
        },
      },
      true,
    )

    // const r1 = graph.createNode({
    //   shape: 'custom-rect',
    //   label: '开始',
    //   data: {
    //     name: "文本",
    //     content: '开始'
    //   },
    //   attrs: {
    //     data: {
    //       name: "文本",
    //       content: '开始'
    //     },
    //     body: {
    //       rx: 20,
    //       ry: 26,
    //     },
    //   },
    // })

    const r1 = graph.createNode({
      width: 66,
      height: 36,
      shape: 'text-block',
      text: `编辑文本`,
      attrs: {
        data:{
          name:'编辑文本',
          content:''
        },
        body: {
          fill: '#efdbff',
          stroke: '#9254de',
          rx: 2,
          ry: 2,
        },
      },
    })


    const imageShapes = [
      {
        label: 'self',
        image: pipelineCross,
        data: {
          name: "交叉管道",
          content: '',
        }
      },
      {
        label: 'self',
        image: pipelineRevolve,
        data: {
          name: "旋转管道",
          content: '',
        }
      },
      {
        label: 'self',
        image: pipelineTransverse,
        data: {
          name: "横向管道",
          content: '',
        }
      }
    ]
    const imageNodes = imageShapes.map((item) =>
      graph.createNode({
        shape: 'custom-image',
        label: item.label,
        attrs: {
          data: item.data,
          image: {
            'xlink:href': item.image,
          },
        }
      }),
    )
    stencil.load([r1], 'group1')
    stencil.load(imageNodes, 'group2')

    graph.on('cell:click', (e) => {
      const { cell } = e
      window.console.log(cell.toJSON())
      const { data } = cell.getAttrs()
      const { name, content } = data
      const { current } = this.formRef
      current.setFieldsValue({
        name,
        content
      })
      this.setState({
        cell
      })
    })

    this.setState({ graphView: graph })
  }

  // 保存
  confirm = () => {
    const { current } = this.formRef
    // const { graphView } = this.state
    current.validateFields().then((values: any) => {
      const { content } = values
      const { graphView, cell } = this.state
      const cellAttrs: any = cell.getAttrs()
      const { data,label,shape } = cellAttrs
      if(shape){

      }
      const newCellData = { ...cellAttrs, data: { ...data, content } }
      cell.setAttrs(newCellData)
    })
  }

  // 预览
  preview = () => {
    const { graphView } = this.state
    const graphData: any = graphView.toJSON()
    this.setState({
      graphData,
      isPreview: true
    }, () => {
      graphView?.dispose()
      const { graphData } = this.state
      const container: any = document.getElementById('preview-container')
      const graph = new Graph({
        container,
        grid: true,
        interacting: {
          nodeMovable: false
        },
      });

      graph.fromJSON(graphData);


      graph.on('cell:click', (e) => {
        const { cell } = e
        const { data } = cell.getAttrs()
        const { name, content } = data
        const { current } = this.formRef
        current.setFieldsValue({
          name,
          content
        })
      })

      // graph.getCells()

      this.setState({ graphView: graph })
    })
  }

  formChange = (a: any, b: any) => {
    window.console.log(a)
  }


  componentDidMount() {
    this.initializeView()
  }

  render() {
    const { isPreview } = this.state
    return <div id='container'>
      {!isPreview ? <>
        <div id='stencil' />
        <div id='graph-container' />
      </> : <div id='preview-container'>1</div>}

      <div id='action'>
        <Button onClick={this.preview} type='primary'>预览</Button>
        <div className='form'>
          <Form
            ref={this.formRef}
            name="basic"
            autoComplete="off"
            onFieldsChange={this.formChange}
            validateTrigger='onBlur'
          >
            <Form.Item
              label="名称"
              name="name"
              rules={[{ required: true, message: 'Please input your username!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="数据"
              name="content"
              rules={[{ required: true, message: '请填写数据' }]}
            >
              <Input />
            </Form.Item>
          </Form>
          <Button onClick={this.confirm} type='primary'>保存</Button>
        </div>
      </div>
    </div>
  }
}
