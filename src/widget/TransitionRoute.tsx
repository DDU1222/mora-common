import * as React from 'react'
import {Route, RouteProps, RouteComponentProps} from 'react-router-dom'
import {matchPath, match} from 'react-router'
import {Transition} from '../widget/Transition'
import {assignStyle} from '../dom/style'

export interface ITransitionRouteProps extends React.HTMLAttributes<HTMLDivElement> {
  items: RouteProps[]
  animation?: string
  animationDuration?: string
  extra?: (activeRouteProps: RouteProps | undefined, activeRouteKey: string) => any
}

// 不能继承 PureComponent， 否则 Route 不会更新
export class TransitionRoute extends React.Component<ITransitionRouteProps, any> {
  static defaultProps = {
    animation: 'fadeIn',
    animationDuration: '0.4s'
  }
  /*
    根据 Switch 组件改编
    本来应该这样写： <Switch location={routeProps.location} children={this.props.items.map((item, i) => <Route key={i} {...item} />)} />
  */
  getRoute(routeProps: RouteComponentProps<any>) {
    let {items} = this.props

    let {location: {pathname, search}} = routeProps
    let m: match<any> | undefined | null
    let matchedItem: RouteProps | undefined

    items.some(item => {
      m = matchPath(pathname, item)
      matchedItem = item
      return !!m
    })

    return m
      ? {key: m.url + search, route: <Route {...matchedItem} />, routeProps: matchedItem }
      : {key: '', route: null, routeProps: matchedItem}
  }

  render() {
    let {items, animation: animationName, animationDuration, extra, ...props} = this.props
    return (
      <Route render={routeProps => {
        let {key, route, routeProps: rp} = this.getRoute(routeProps)
        let extraEl: any
        if (extra) extraEl = extra(rp, key)

        let trans = <Transition
          className='wTransitionRoute gInEffect'
          groupProps={{component: 'span'}}
          itemKey={key}
          componentProps={props}
          name='route' // 动画现在是通过注入样式来实现了，没有通过此 name
          leave={false}
          beforeEnter={el => assignStyle(el, {animationName, animationDuration})}
          enter
          children={route}
        />

        return extraEl ? <div>{trans}{extraEl}</div> : trans
      }}/>
    )
  }
}

