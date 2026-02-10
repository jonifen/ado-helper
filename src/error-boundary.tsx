import { Component, type ErrorInfo } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, details: {} };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, details: error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ details: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          An error has occurred
          <div>{JSON.stringify(this.state.details)}</div>
        </div>
      );
    }

    return this.props.children;
  }
}
