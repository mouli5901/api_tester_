import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled app error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-screen">
          <div className="error-boundary-card">
            <p className="error-boundary-eyebrow">API Testing</p>
            <h1>Something went off script.</h1>
            <p>
              The app hit an unexpected error. Refresh the workspace and try again.
            </p>
            <button type="button" onClick={this.handleRetry}>
              Retry
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
