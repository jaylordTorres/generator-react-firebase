import React from 'react'
import PropTypes from 'prop-types'<% if (includeRedux) { %>
import { isEmpty } from 'react-redux-firebase'<% } %>
import { Route, Switch } from 'react-router-dom'
import ProjectRoute from 'routes/Projects/routes/Project'
import ProjectTile from '../ProjectTile'
import NewProjectTile from '../NewProjectTile'
import NewProjectDialog from '../NewProjectDialog'
import { renderChildren } from 'utils/router'

const ProjectsPage = ({
  projects,
  collabProjects,
  auth,
  newDialogOpen,
  toggleDialog,
  deleteProject,
  addProject,
  classes,
  match,
  goToProject
}) => (
  <Switch>
    {/* Child routes */}
    {renderChildren([ProjectRoute], match, { auth })}
    {/* Main Route */}
    <Route
      exact
      path={match.path}
      render={() => (
        <div className={classes.root}>
          <NewProjectDialog
            onSubmit={addProject}
            open={newDialogOpen}
            onRequestClose={toggleDialog}
          />
          <div className={classes.tiles}>
            <NewProjectTile onClick={toggleDialog} />
            {<% if (includeRedux) { %>!isEmpty(projects)<% } %><% if (!includeRedux) { %>projects && projects.length<% } %> &&
              projects.map((project, ind) => (
                <ProjectTile
                  key={`Project-${project.<% if (includeRedux && includeFirestore) { %>id<% } else { %>key<% } %>}-${ind}`}
                  name={<% if (includeRedux && includeFirestore) { %>project.name<% } else { %>project.value.name<% } %>}
                  onSelect={() => goToProject(project.<% if (includeRedux && includeFirestore) { %>id<% } else { %>key<% } %>)}
                  onDelete={() => deleteProject(project.<% if (includeRedux && includeFirestore) { %>id<% } else { %>key<% } %>)}
                />
              ))}
          </div>
        </div>
      )}
    />
  </Switch>
)

ProjectsPage.propTypes = {
  classes: PropTypes.object.isRequired, // from enhancer (withStyles)
  match: PropTypes.object.isRequired, // from enhancer (withRouter)
  auth: PropTypes.object, // from enhancer (connect + firebaseConnect - firebase)
  projects: PropTypes.array, // from enhancer (connect + firebaseConnect - firebase)
  newDialogOpen: PropTypes.bool, // from enhancer (withStateHandlers)
  toggleDialog: PropTypes.func.isRequired, // from enhancer (withStateHandlers)
  deleteProject: PropTypes.func.isRequired, // from enhancer (withHandlers - firebase)
  collabProjects: PropTypes.object, // from enhancer (withHandlers - firebase)
  addProject: PropTypes.func.isRequired, // from enhancer (withHandlers - firebase)
  goToProject: PropTypes.func.isRequired // from enhancer (withHandlers - router)
}

export default ProjectsPage
