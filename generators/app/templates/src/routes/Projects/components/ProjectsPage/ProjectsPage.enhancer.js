<% if (includeRedux) { %>import { connect } from 'react-redux'<% } %>
import { withRouter } from 'react-router-dom'
import { compose, withHandlers, withStateHandlers, setDisplayName } from 'recompose'<% if (includeRedux && includeFirestore) { %>
import { firestoreConnect } from 'react-redux-firebase'<% } %><% if (includeRedux && !includeFirestore) { %>
import { firebaseConnect } from 'react-redux-firebase'<% } %><% if (!includeRedux) { %>
import firebase from 'firebase/app'<% } %>
import { withStyles } from '@material-ui/core/styles'
import { LIST_PATH } from 'constants/paths'
import { withNotifications } from 'modules/notification'
import { spinnerWhileLoading } from 'utils/components'
import { UserIsAuthenticated } from 'utils/router'
import styles from './ProjectsPage.styles'

export default compose(
  // Set component display name (more clear in dev/error tools)
  setDisplayName('EnhancedProjectsPage'),<% if (includeRedux) { %>
  // redirect to /login if user is not logged in
  UserIsAuthenticated,
  // Map auth uid from state to props
  connect(({ firebase: { auth: { uid } } }) => ({ uid })),
  // Wait for uid to exist before going further
  spinnerWhileLoading(['uid']),
  <% } %><% if (includeRedux && !includeFirestore) { %>
  // Create listeners based on current users UID
  firebaseConnect(({ params, uid }) => [
    {
      path: 'projects',
      queryParams: ['orderByChild=createdBy', `equalTo=${uid}`]
    }
  ]),
  // Map projects from state to props
  connect(({ firebase: { ordered } }) => ({
    projects: ordered.projects
  })),<% } %><% if (includeRedux && includeFirestore) { %>firestoreConnect(({ params, uid }) => [
    // Listener for projects the current user created
    {
      collection: 'projects',
      where: ['createdBy', '==', uid]
    }
  ]),
  // Map projects from state to props
  connect(({ firestore: { ordered } }) => ({
    projects: ordered.projects
  })),<% } %><% if (includeRedux) { %>
  // Show loading spinner while projects and collabProjects are loading
  spinnerWhileLoading(['projects']),<% } %>
  // Add props.router
  withRouter,
  // Add props.showError and props.showSuccess
  withNotifications,
  // Add state and state handlers as props
  withStateHandlers(
    // Setup initial state
    ({ initialDialogOpen = false }) => ({
      newDialogOpen: initialDialogOpen
    }),
    // Add state handlers as props
    {
      toggleDialog: ({ newDialogOpen }) => () => ({
        newDialogOpen: !newDialogOpen
      })
    }
  ),
  // Add handlers as props
  withHandlers({
    addProject: props => newInstance => {
      const { showError, showSuccess, toggleDialog<% if (includeRedux) { %>uid, <% } %><% if (includeRedux && includeFirestore) { %>, firestore<% } else { %>, firebase<% } %> } = props
      if (!<% if (!includeRedux) { %>firebase.auth().currentUser<% } else { %>uid<% } %>) {
        return showError('You must be logged in to create a project')
      }
      return <% if (includeRedux && includeFirestore) { %>firestore
        .add(
          { collection: 'projects' },
          {
            ...newInstance,
            createdBy: uid,
            createdAt: firestore.FieldValue.serverTimestamp()
          }
        )<% } %><% if (includeRedux && !includeFirestore) { %>firebase
        .push('projects', {
          ...newInstance,
          createdBy: uid,
          createdAt: firebase.database.ServerValue.TIMESTAMP
        })<% } %><% if (!includeRedux && !includeFirestore) { %>firebase.database()
        .ref('projects')
        .push({
          ...newInstance,
          createdBy: firebase.auth().currentUser,
          createdAt: firebase.database.ServerValue.TIMESTAMP
        })<% } %><% if (!includeRedux && includeFirestore) { %>firebase.firestore()
        .collection('projects')
        .add({
          ...newInstance,
          createdBy: firebase.auth().currentUser,
          createdAt: firebase.database.ServerValue.TIMESTAMP
        })<% } %>
        .then(() => {
          toggleDialog()
          showSuccess('Project added successfully')
        })
        .catch(err => {
          console.error('Error:', err) // eslint-disable-line no-console
          showError(err.message || 'Could not add project')
          return Promise.reject(err)
        })
    },
    deleteProject: props => projectId => {
      const { showError, showSuccess<% if (includeRedux && includeFirestore) { %>, firestore<% } %><% if (includeRedux && !includeFirestore) { %>, firebase<% } %> } = props
      return <% if (includeRedux && includeFirestore) { %>firestore
        .delete({ collection: 'projects', doc: projectId })<% } %><% if (includeRedux && !includeFirestore) { %>firebase
        .remove(`projects/${projectId}`)<% } %><% if (!includeRedux && !includeFirestore) { %>firebase.database()
        .ref(`projects/${projectId}`)
        .remove()<% } %><% if (!includeRedux && includeFirestore) { %>firebase.firestore()
        .collection('projects')
        .doc(projectId)
        .remove()<% } %>
        .then(() => showSuccess('Project deleted successfully'))
        .catch(err => {
          console.error('Error deleting project:', err) // eslint-disable-line no-console
          showError(err.message || 'Could not delete project')
          return Promise.reject(err)
        })
    },
    goToProject: ({ history }) => projectId => {
      history.push(`${LIST_PATH}/${projectId}`)
    }
  }),
  // Add styles as props.classes
  withStyles(styles)
)
