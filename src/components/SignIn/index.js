import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { db } from '../../firebase';
import { SignUpLink } from '../SignUp';
import { PasswordForgetLink } from '../PasswordForget';
import { auth } from '../../firebase';
import * as routes from '../../constants/routes';
 

const updateByPropertyName = (propertyName, value) => () => ({
  [propertyName]: value,
});

const INITIAL_STATE = {
  email: '',
  password: '',
  error: null,
};

class SignInForm extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = (event) => {
    event.preventDefault();
    const {
      email,
      password,
    } = this.state;

    const {
      history,
    } = this.props;
    let accountObject = {};
    let route = routes.ACCOUNT;
    auth.doSignInWithEmailAndPassword(email, password)
      .then((obj) => {
        db.getOneUser(obj.user.uid)
            .then(object=>{
              accountObject= object.val();
              if(accountObject.admin == true) {
                route = routes.ADMIN_APPLICATION_VIEW;
              }
              db.getApplications().then(snapshot=> {
                let applications = []
                let userApplications = [];
                let data = snapshot.val();
                for (let application in data) {
                  applications.push(application)
                  if(data[application].parent1Email == accountObject.email) {
                    userApplications.push(data[application]);
                  }
                }
                if(route == routes.ADMIN_APPLICATION_VIEW) {
                  userApplications = applications;
                }
                return userApplications;

            }).then(userApplicationInfo => {
              history.push({pathname: route, state: {applications: userApplicationInfo, accountObject: accountObject, weekTime: this.props.location.state.campTimes}})
            })
              })
            .catch(error=>{
            });
      })
      .catch(error => {
        this.setState(updateByPropertyName('error', error));
      });

  }

  render() {
    const {
      email,
      password,
      error,
    } = this.state;

    const isInvalid =
      password === '' ||
      email === '';  
    return (

      <form onSubmit={this.onSubmit}>
        <input
          value={email}
          onChange={event => this.setState(updateByPropertyName('email', event.target.value))}
          type="text"
          placeholder="Email Address"
        />
        <input
          value={password}
          onChange={event => this.setState(updateByPropertyName('password', event.target.value))}
          type="password"
          placeholder="Password"
        />
        <button disabled={isInvalid} type="submit">
          Sign In
        </button>

        { error && <p>{error.message}</p> }
      </form>
    );
  }
}

export default withRouter(SignInForm);
