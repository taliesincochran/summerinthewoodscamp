import React, { Component } from 'react';
import Helmet from 'react-helmet';
import '../assets/scss/main.scss';
import Navigation from '../components/Navigation';
import withAuthentication from '../components/Session/withAuthentication';
import Header from '../components/Header'
import './index.css';
import Footer from '../components/Footer'
import Menu from '../components/Menu'
import PropTypes from 'prop-types'
import { Link, withPrefix } from 'gatsby-link'
import { db } from '../firebase';


// const CLIENT = {
//   sandbox: process.env.PAYPAL_CLIENT_ID_SANDBOX,
//   production: process.env.PAYPAL_CLIENT_ID_PRODUCTION,
// };

class TemplateWrapper extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isMenuVisible: false,
            loading: 'is-loading',
            admin: ''
        }
        this.handleToggleMenu = this.handleToggleMenu.bind(this)
    }
    componentDidMount () {
        this.timeoutId = setTimeout(() => {
            this.setState({loading: ''});
        }, 100);
        db.getAdmin().then(snapshot=> this.setState({admin: snapshot.val()}))
    }

    componentWillUnmount () {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }

    handleToggleMenu() {
        this.setState({
            isMenuVisible: !this.state.isMenuVisible
        })
    }
    render() {
        const { children } = this.props;
        return (
            <div  className={`body ${this.state.loading} ${this.state.isMenuVisible ? 'is-menu-visible' : ''}`}>
                <Helmet>
                <link rel="stylesheet" href={withPrefix('skel.css')} />
                </Helmet>
                <div id="wrapper">
                    <Header onToggleMenu={this.handleToggleMenu} />
                    {children()}
                    <hr/>
                    <Footer pathname={this.props.location.pathname}/>
                </div>
                <Menu onToggleMenu={this.handleToggleMenu}>
                    <Navigation onToggleMenu={this.handleToggleMenu}  admin={this.state.admin}/>
                </Menu>
            </div>
        );
    }
}
TemplateWrapper.propTypes = {
    children: PropTypes.func
}
export default withAuthentication(TemplateWrapper)
