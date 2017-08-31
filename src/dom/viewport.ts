import onview from './onview'

let viewport = {
  width: 0,
  height: 0,

  /** 监听 element 能否在当前窗口下可见 */
  listen(element: Element, callback: () => void, options: IViewportListenOptions = {}): () => void {
    let {disableIntersectionObserver, container, offset = 0, debounce = 0, throttle = 200} = options

    if (!disableIntersectionObserver && typeof IntersectionObserver !== 'undefined') {
      // https://developers.google.com/web/updates/2016/04/intersectionobserver
      let io = new IntersectionObserver(
        entries => entries[0].intersectionRatio > 0 && callback(),
        {root: container, rootMargin: offset + 'px'}
      )
      io.observe(element)

      return () => {
        io.disconnect()
      }
    } else {
      return onview(() => {
        if (viewport.visiable(element, {container, offset})) callback()
      }, {throttle, debounce, container})
    }
  },

  /**
   * 判断元素 element 是否是在指定的 viewport 内，
   * 如果没指定 viewport，默认使用当前屏幕的宽高所在的 viewport
   */
  visiable(element: Element, options: IViewportInOptions = {}): boolean {
    let rect = element.getBoundingClientRect()

    let {container, offset, viewport: winViewport} = options
    winViewport = expendViewport(winViewport || getDefaultViewport(), offset)

    if (container) {
      let containerRect = container.getBoundingClientRect()
      if (contains(winViewport, containerRect)) {
        let {top, right, bottom, left} = expendViewport(containerRect, offset)
        let containerViewport = {
          top: top > winViewport.top ? top : winViewport.top,
          left: left > winViewport.left ? left : winViewport.left,
          right: right < winViewport.right ? right : winViewport.right,
          bottom: bottom < winViewport.bottom ? bottom : winViewport.bottom
        }
        return contains(containerViewport, rect)
      } else {
        return false
      }
    } else {
      return contains(winViewport, rect)
    }
  }
}

// 实时更新 viewport 的宽高
function setViewport() {
  viewport.width = window.innerWidth || document.documentElement.clientWidth
  viewport.height = window.innerHeight || document.documentElement.clientHeight
}
setViewport()
window.addEventListener('resize', setViewport)

export default viewport

export interface IViewportListenOptions {
  throttle?: number
  debounce?: number
  /** 包括监听 scroll 事件的 container, 和 el 元素的窗器，这两者一般是同一个 */
  container?: Element
  offset?: IOffset
  disableIntersectionObserver?: boolean
}

export interface IViewportInOptions {
  viewport?: IViewport
  container?: Element
  offset?: IOffset
}

export interface IViewport {
  top?: number
  left?: number
  right?: number
  bottom?: number
}

export declare type IOffset = number | IViewport

function contains(parent: IViewport, child: IViewport): boolean {
  return child.right >= parent.left &&
    child.bottom >= parent.top &&
    child.left <= parent.right &&
    child.top <= parent.bottom
}

function getDefaultViewport(): IViewport {
  // viewport 会变化，所以需要写在函数中，每次返回一个新对象
  return {
    top: 0,
    left: 0,
    right: viewport.width,
    bottom: viewport.height
  }
}

function expendViewport(rect: IViewport, offset: IOffset): IViewport {
  if (!offset) return rect
  let offsetRect = typeof offset === 'number' ? {left: offset, top: offset, bottom: offset, right: offset} : offset
  let {top = 0, left = 0, right = 0, bottom = 0} = offsetRect
  return {
    top: rect.top - top,
    left: rect.left - left,
    right: rect.right + right,
    bottom: rect.bottom + bottom
  }
}
