import React from 'react';
import {connect, PropTypes} from 'cs-web-components-externals';
import './shared.css';

import HomePage from './HomePage.jsx';
import AdminPage from './AdminPage.jsx';
import CheckerPage from './CheckerPage.jsx';
import PlannerPage from './PlannerPage.jsx';
import ExecutorPage from './ExecutorPage.jsx';
import DashboardPage from './DashboardPage.jsx';
import HierarchyPage from './HierarchyPage.jsx';

class HelloWorld extends React.Component {
    constructor(props) {
        super(props);
        this.state = { page: 'home' };
        this.goTo = this.goTo.bind(this);
    }

    goTo(page) {
        this.setState({ page });
    }

    renderPage() {
        switch (this.state.page) {
            case 'admin': return <AdminPage onNavigate={this.goTo} />;
            case 'checker': return <CheckerPage onNavigate={this.goTo} />;
            case 'planner': return <PlannerPage onNavigate={this.goTo} />;
            case 'executor': return <ExecutorPage onNavigate={this.goTo} />;
            case 'dashboard': return <DashboardPage onNavigate={this.goTo} />;
            case 'hierarchy': return <HierarchyPage onNavigate={this.goTo} />;
            case 'home':
            default: return <HomePage onNavigate={this.goTo} />;
        }
    }

    render() {
        return this.renderPage();
    }
}

HelloWorld.propTypes = {
    thunkAction: PropTypes.func,
    asyncAction: PropTypes.func
};

function mapStateToProps(state /*, ownProps */) {
    return {
        something: state
    };
}

function mapDispatchToProps(dispatch) {
    return {
        thunkAction: () => { dispatch(thunkActionCreator()) },
        asyncAction: () => { dispatch(asyncActionCreator()) }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(HelloWorld);