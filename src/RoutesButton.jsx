import React from 'react';

class RoutesButton extends React.Component{
    render() {
        return <div><button
        onClick={this.props.onClick}>{this.props.label}</button></div>
    }
}

export default RoutesButton;