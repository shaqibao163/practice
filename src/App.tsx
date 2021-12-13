import React, { Component } from 'react';
import { Button, Form, Input } from 'antd'
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { Graph } from '@antv/x6'

// import graphData from './mock/appData'
import './App.css';
import { getX6Render } from './components/x6';

interface IState {
  currentCell: any
  graphView: any
  graphData: any[]
  isPreview: boolean
}

export default class App extends Component<any, IState> {
  formRef: any = React.createRef()
  graphHistory: any
  state = {
    currentCell: { getAttrs: () => { }, setAttrs: (a: any) => { } },
    graphView: {
      history: { canUndo: () => (null), undo: () => { } }, cut: (n: any) => { }, select: (n: any) => { },
      cleanSelection: () => { }, paste: (n: any) => { }, copy: (n: any) => { }, toJSON: () => { }, dispose: () => { },
      on: (a: string, e: any) => { }, getCellById: (a: string) => { }, zoom: (n: number, m?: any) => { }, getSelectedCells: () => { },
      isClipboardEmpty: () => null
    },
    graphData: [],
    isPreview: false,

  }


  // 点击节点事件
  nodeAction = (type: string) => {

    interface IPositions {
      x: number
      y: number
    }

    const { graphView } = this.state
    const cells: any = graphView.getSelectedCells();
    switch (type) {

      // 复制/粘贴
      case 'copy':
        if (cells.length) {
          graphView.copy(cells);
          if (!graphView.isClipboardEmpty()) {
            const cells = graphView.paste({ offset: 32 });
            graphView.cleanSelection();
            graphView.select(cells);
          }
        }
        break;

      // 撤销
      case 'undo':
        if (graphView.history.canUndo()) {
          graphView.history.undo();
        }
        break;

      // 节点层级置顶
      case 'top':
        if (cells.length) {
          cells.forEach((cell: any) => {
            cell.toFront()
          })
        }
        break;

      // 节点层级置底
      case 'bottom':
        if (cells.length) {
          cells.forEach((cell: any) => {
            cell.toBack()
          })
        }
        break;

      // 放大画布
      case 'zoomL':
        graphView.zoom(1)
        break;

      // 缩小画布
      case 'zoomS':
        graphView.zoom(-1)
        break;

      // 还原画布
      case 'zoomD':
        graphView.zoom(1, { absolute: true })
        break;

      // 左对齐
      case 'leftAlign':
      // 右对齐
      case 'rightAlign':

        const positions = cells.reduce((pre: any, cur: any) => {
          const { x, y } = cur.position()
          pre.push({
            x, y
          })
          return pre
        }, [])

        const finalX: number = Math[type === 'leftAlign' ? 'min' : 'max'].apply(Math, positions.map((item: IPositions) => item.x))

        cells.forEach((cell: any) => {
          const { y } = cell.position()
          cell.position(finalX, y)
        })
        break
      // 顶部对齐
      case 'topAlign':
      // 底部对齐
      case 'bottomAlign':

        const positionss = cells.reduce((pre: any, cur: any) => {
          const { x, y } = cur.position()
          pre.push({
            x, y
          })
          return pre
        }, [])



        const finalY: number = Math[type === 'topAlign' ? 'min' : 'max'].apply(Math, positionss.map((item: IPositions) => item.y))

        cells.forEach((cell: any) => {
          const { x } = cell.position()
          cell.position(x, finalY)
        })



        break;

      // 水平对齐
      case 'horizontalAlign':
        break;

      // 垂直对齐
      case 'verticalAlign':
        break;
      default:
        break;
    }
  }

  // 初始化
  initializeView = () => {
    const graph = getX6Render()
    graph.on('cell:click', (e: any) => {
      const { cell } = e
      const { data } = cell.toJSON()
      const { current } = this.formRef
      current.setFieldsValue(data)
      this.setState({
        currentCell: cell
      })
    })

    graph.on('blank:click', (e: any) => {
      window.console.log(e)
    })

    this.graphHistory = graph.history

    this.setState({ graphView: graph })
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


      // graph.on('cell:click', (e) => {
      //   const { cell } = e
      //   const { data } = cell.getAttrs()
      //   const { name, content } = data
      //   const { current } = this.formRef
      //   current.setFieldsValue({
      //     name,
      //     content
      //   })
      // })

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
    return <div id='container-box'>
      <div id='container-header'>
        <Button onClick={() => this.nodeAction('copy')}>复制 / 粘贴（ctrl+c）</Button>
        <Button onClick={() => this.nodeAction('undo')}>撤销（ctrl+z）</Button>
        <Button onClick={() => this.nodeAction('top')}>原件置顶</Button>
        <Button onClick={() => this.nodeAction('bottom')}>原件置底</Button>
        <Button onClick={() => this.nodeAction('zoomL')}><PlusOutlined /></Button>
        <Button onClick={() => this.nodeAction('zoomS')}><MinusOutlined /></Button>
        <Button onClick={() => this.nodeAction('zoomD')}>还原比例</Button>
        <Button onClick={() => this.nodeAction('leftAlign')}>左对齐</Button>
        <Button onClick={() => this.nodeAction('rightAlign')}>右对齐</Button>
        <Button onClick={() => this.nodeAction('topAlign')}>顶部对齐</Button>
        <Button onClick={() => this.nodeAction('bottomAlign')}>底部对齐</Button>
        <Button onClick={this.preview}>预览</Button>
      </div>
      <div id='container-main'>
        {!isPreview ? <>
          <div id='stencil' />
          <div id='graph-container' />
        </> : <div id='preview-container'>1</div>}
        <div id='action'>
          <div className='form'>
            <Form
              ref={this.formRef}
              name="basic"
              autoComplete="off"
              onFieldsChange={this.formChange}
              validateTrigger='onBlur'
            >
              <Form.Item
                label="原件类型名称"
                name="typeName"
              >
                <Input disabled />
              </Form.Item>
              <Form.Item
                label="原件类型key"
                name="type"
              >
                <Input disabled />
              </Form.Item>
              <Form.Item
                label="数据"
                name="data"
              >
                <Input />
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>

    </div>
  }
}
