/*
 * @Description: 
 * @Version: 1.0
 * @Author: bclz
 * @Date: 2021-12-01 15:11:59
 * @LastEditors: bclz
 * @LastEditTime: 2021-12-10 09:38:29
 */
import React, { Component } from 'react';
import { Button, Form, Input } from 'antd'
import { Graph } from '@antv/x6'

// import graphData from './mock/appData'
import './App.css';
import { getX6Render } from './components/x6';

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
   const graph = getX6Render()
    graph.on('cell:click', (e:any) => {
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
        </div>
      </div>
    </div>
  }
}
