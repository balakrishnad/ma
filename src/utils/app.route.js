// routes.js
import React, { useEffect, Suspense, lazy, useState, useRef } from 'react';
import { Switch, Route, HashRouter as Router, NavLink, Redirect } from 'react-router-dom';
import Axios from 'axios';
import { ErrorBoundary } from './errorBoundry';
import { Header } from '../components';
import Footer from '../components/Footer';
import { MoveToTopIcon, SignOutIcon, RemoveIcon, ArchivedInventoryIcon } from '../components/common/SVG';
import Unauthorized from '../containers/Unauthorized/Unauthorized';
import { setUserObj, getUserObj, setUserRole, getUserRole, getUserEmail, clearUser } from './userRolehelper';
import { serviceUrlHost } from '../utils/apiUrls';
import PrivateRoute from './PrivateRoute';
import * as Constants from '../utils/constants';
import {
  HomeMenuIcon, CreateInventoryIcon, BrowseInventoryIcon,
  AssetDownloadIcon, PendingApprovalsIcon, ManageUsersIcon,
  WorkflowMenuIcon, DashboardMenuIcon, ManageCampaignMenuIcon,
  CreateCampaignMenuIcon, UploadAssetMenuIcon
} from '../components/common';

import { Navbar, Nav, NavDropdown } from 'react-bootstrap/';
import './app.route.css';
import profilePicSmall from '../styles/images/profile-pic-small.png';


const LoadableDashboard = lazy(() =>
  import(/* webpackChunkName: "dashboard" */ '../containers/Common/Dashboard')
);

const LoadableHome = lazy(() =>
  import(/* webpackChunkName: "home" */ '../containers/Common/Home')
);

const LoadableCreateInventory = lazy(() =>
  import(/* webpackChunkName: "createInventory" */ '../containers/CreateInventory/CreateInventory')
);

const LoadableBrowseInventory = lazy(() =>
  import(/* webpackChunkName: "browseInventory" */ '../containers/BrowseInventory/BrowseInventory')
);

const LoadablePendingApprovals = lazy(() =>
  import(/* webpackChunkName: "pendingApprovals" */ '../containers/PendingApprovals/PendingApprovals')
);

const LoadableAssetDownload = lazy(() =>
  import(/* webpackChunkName: "assetDownload" */ '../containers/Assets/AssetDownload')
);

const LoadableAssetUpload = lazy(() =>
  import(/* webpackChunkName: "assetUpload" */ '../containers/Assets/assetUpload')
);

const LoadableManageUsers = lazy(() =>
  import(/* webpackChunkName: "manageUsers" */ '../containers/ManageUsers/ManageUsers')
);

const LoadableCreateCampaign = lazy(() =>
  import(/* webpackChunkName: "createCampaign" */ '../containers/Campaign/CreateCampaign')
);

const LoadableManageCampaign = lazy(() =>
  import(/* webpackChunkName: "manageCampaign" */ '../containers/Campaign/ManageCampaign')
);

const LoadableWorkflowReporting = lazy(() =>
  import(/* webpackChunkName: "workflowReporting" */ '../containers/Common/WorkflowReporting')
);

const LoadableUnauthorized = lazy(() =>
  import(/* webpackChunkName: "unauthorized" */ '../containers/Unauthorized/Unauthorized')
);

const LoadableNotifications = lazy(() =>
  import(/* webpackChunkName: "notifications" */ '../containers/Common/Notifications')
);

const LoadableArchived = lazy(() =>
  import(/* webpackChunkName: "notifications" */ '../containers/ArchivedInventory/ArchivedInventory')
);

const LoadingMessage = () => "Loading...";

const RoleBasedMenu = {
  Admin: [
    {
      DisplayName: 'Dashboard',
      Icon: <DashboardMenuIcon />,
      route: '/dashboard'
    },
    {
      DisplayName: 'Manage User',
      Icon: <ManageUsersIcon />,
      route: '/manageUsers',
    },
    {
      DisplayName: 'Browse Inventory',
      Icon: <BrowseInventoryIcon />,
      route: '/browseInventory',
    },
    {
      DisplayName: 'Workflow Reporting',
      Icon: <WorkflowMenuIcon />,
      route: '/workflow',
    },
    {
      DisplayName: 'Archived Inventory',
      Icon: <ArchivedInventoryIcon />,
      route: '/archived',
    },
    {
      DisplayName: 'Notifications',
      route: '/notifications'
    }
  ],
  CMM: [
    {
      DisplayName: 'Home',
      Icon: <HomeMenuIcon />,
      route: '/home',
    },
    {
      DisplayName: 'Create Inventory',
      Icon: <CreateInventoryIcon />,
      route: '/createInventory',
    },
    {
      DisplayName: 'Browse Inventory',
      Icon: <BrowseInventoryIcon />,
      route: '/browseInventory',
    },
    {
      DisplayName: 'Pending Approvals',
      Icon: <PendingApprovalsIcon />,
      route: '/pendingApprovals',
    },
    {
      DisplayName: 'Asset Download',
      Icon: <AssetDownloadIcon />,
      route: '/assetDownload',
    },
    {
      DisplayName: 'Notifications',
      route: '/notifications'
    }
  ],
  MediaManager: [
    {
      DisplayName: 'Home',
      Icon: <HomeMenuIcon />,
      route: '/home',
    },
    {
      DisplayName: 'Create Campaign',
      Icon: <CreateCampaignMenuIcon />,
      route: '/createCampaign',
    },
    {
      DisplayName: 'Manage Campaign',
      Icon: <ManageCampaignMenuIcon />,
      route: '/manageCampaign',
    },
    {
      DisplayName: 'Browse Inventory',
      Icon: <BrowseInventoryIcon />,
      route: '/browseInventory',
    },
    {
      DisplayName: 'Notifications',
      route: '/notifications'
    }
  ],
  BrandManager: [
    {
      DisplayName: 'Home',
      Icon: <HomeMenuIcon />,
      route: '/home',
    },
    {
      DisplayName: 'Upload Creative Asset',
      Icon: <UploadAssetMenuIcon />,
      route: '/assetUpload',
    },
    {
      DisplayName: 'Notifications',
      route: '/notifications'
    }
  ]
};

const RoleBasedMenuMobile = {
  Admin: [
    {
      DisplayName: 'Dashboard',
      Icon: <DashboardMenuIcon />,
      route: '/dashboard'
    },
    {
      DisplayName: 'Browse Inventory',
      Icon: <BrowseInventoryIcon />,
      route: '/browseInventory',
    },
    {
      DisplayName: 'Notifications',
      route: '/notifications'
    }
  ],
  CMM: [
    {
      DisplayName: 'Home',
      Icon: <HomeMenuIcon />,
      route: '/home',
    },
    {
      DisplayName: 'Browse Inventory',
      Icon: <BrowseInventoryIcon />,
      route: '/browseInventory',
    },
    {
      DisplayName: 'Pending Approvals',
      Icon: <PendingApprovalsIcon />,
      route: '/pendingApprovals',
    },
    {
      DisplayName: 'Notifications',
      route: '/notifications'
    }
  ],
  MediaManager: [
    {
      DisplayName: 'Home',
      Icon: <HomeMenuIcon />,
      route: '/home',
    },
    {
      DisplayName: 'Browse Inventory',
      Icon: <BrowseInventoryIcon />,
      route: '/browseInventory',
    },
    {
      DisplayName: 'Notifications',
      route: '/notifications'
    }
  ],
  BrandManager: [
    {
      DisplayName: 'Home',
      Icon: <HomeMenuIcon />,
      route: '/home',
    },
    {
      DisplayName: 'Notifications',
      route: '/notifications'
    }
  ]
};

function getWindowWidth() {
  //const DeviceWidth = window.outerWidth;
  return window.outerWidth === 0 ? screen.width : window.outerWidth;
}

const getMenuBasedOnRoleName = (name, width) => {
  let rtn = [];
  width = width === undefined ? getWindowWidth() : width;
  if (width < 768) {
    switch (name) {
      case Constants.ADMIN:
        rtn = RoleBasedMenuMobile['Admin'];
        break;
      case Constants.CMM:
        rtn = RoleBasedMenuMobile['CMM'];
        break;
      case Constants.MM:
        rtn = RoleBasedMenuMobile['MediaManager'];
        break;
      case Constants.BM:
        rtn = RoleBasedMenuMobile['BrandManager'];
        break;
      default:
        rtn = [];
        break;
    }
  } else {
    switch (name) {
      case Constants.ADMIN:
        rtn = RoleBasedMenu['Admin'];
        break;
      case Constants.CMM:
        rtn = RoleBasedMenu['CMM'];
        break;
      case Constants.MM:
        rtn = RoleBasedMenu['MediaManager'];
        break;
      case Constants.BM:
        rtn = RoleBasedMenu['BrandManager'];
        break;
      default:
        rtn = [];
        break;
    }
  }

  return rtn;
};

const tempUserObj = {
  emailID: 'Pritesh.Borse.Contractor@pepsico.com',
  firstName: 'Media Annex',
  lastName: 'User',
  Picture: null,
  preferredRole: 2,
  roles: [
    { RoleID: "1", RoleName: "Administrator", ScreenName: "Dashboard;Manage User;Browse Inventory;Workflow Reporting" },
    { RoleID: "2", RoleName: "Customer Marketing Manager", ScreenName: "Home;Create Inventory;Browse Inventory;Pending Approvals;Asset Download" },
    { RoleID: "3", RoleName: "Media Manager", ScreenName: "Home;Create Campaign;Manage Campaign;Browse Inventory" },
    { RoleID: "4", RoleName: "Brand Manager", ScreenName: "Home;Upload Creative Asset" }
  ],
};

const defaultUserObj = {
  emailID: '',
  firstName: '',
  lastName: '',
  Picture: null,
  roles: [],
};

const AppRoute = () => {
  const [loggedInUser, setLoggedInUser] = useState(defaultUserObj);
  const [loggedInRole, setLoggedInRole] = useState('');

  const [windowWidth, setWindowWidth] = useState(getWindowWidth());
  const [notificationCount, setNotificationCount] = useState(0);
  let timeout = null;

  const arrow = useRef();
  const [showUserOptions, setShowUserOptions] = useState(false);
  const userOpt = useRef();

  const profilePicture = (!loggedInUser.Picture) ? profilePicSmall : "data:image/png;base64," + loggedInUser.Picture; /*require("../user-ashley-mason.jpg");*/
  const userName = loggedInUser.firstName + ' ' + loggedInUser.lastName || "";
  const userRole = getUserRole();

  const toggle = () => {
    setShowUserOptions(!showUserOptions);
    if (showUserOptions) {
      arrow.current.classList.remove('fa-angle-up');
    } else {
      arrow.current.classList.add('fa-angle-up');
    }
  }
  const changeRole = (role) => {
    toggle();
    changeUserRole(role);
  }
  const logout = () => {
    toggle();
    clearUser();
    window.location.replace(serviceUrlHost + "/.auth/logout");
  }
  const blurBack = () => {
    let body = document.getElementById('body');
    let check = body.classList.contains('blur');
    let bodyWrapper = document.getElementById('bodyWrapper');
    if (check) {
      body.classList.remove('blur');
      bodyWrapper.classList.remove('blurBack');
    }
    else {
      body.classList.add('blur');
      bodyWrapper.classList.add('blurBack');
    }
  }

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(getWindowWidth())
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  useEffect(() => {
    if (loggedInUser.roles.length > 0) {
      if (!loggedInUser.roles[0].RoleName) {
        setLoggedInRole('');
      } else {
        const sesRole = getUserRole();
        if (sesRole) {
          setLoggedInRole(sesRole);
          // setUserRole(loggedInUser.roles[0].RoleName);
        } else {
          let roleName = loggedInUser.roles.filter((role) => {
            return role.RoleID == loggedInUser.preferredRole;
          });
          roleName = roleName[0].RoleName;
          setLoggedInRole(roleName);
          setUserRole(roleName);
        }
      }
    }

  }, [loggedInUser]);

  useEffect(() => {
    if (serviceUrlHost.includes('mediaannexdev')) {
      const user = getUserObj();
      let roleName = tempUserObj.roles.filter((role) => {
        return role.RoleID == tempUserObj.preferredRole;
      });
      roleName = roleName[0].RoleName;
      if (!user) {
        setLoggedInUser(tempUserObj);
        setUserObj(tempUserObj);
        setUserRole(roleName);
      } else {
        if (user.emailID !== tempUserObj.emailID) {
          setLoggedInUser(tempUserObj);
          setUserObj(tempUserObj);
          setUserRole(roleName);
        } else {
          setLoggedInUser(user);
        }
      }
      getNotificationCount();
    } else {
      Axios({
        url: serviceUrlHost + '/.auth/me',
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': true
        },
      })
        .then(res => {
          if (res && res.data && res.data[0]) {
            const emailID = res.data[0].user_id;

            Axios({
              url: serviceUrlHost + '/api/User/GetUserInfo',
              method: 'get',
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': true
              },
            }).then(info => {
              if (info && info.data) {
                const loggedInData = {
                  ...loggedInUser,
                  firstName: info.data.Firstname,
                  lastName: info.data.Lastname,
                  Picture: info.data.Picture,
                  roles: info.data.UserRoles,
                  emailID,
                  preferredRole: info.data.PreferredRole
                }
                setLoggedInUser({ ...loggedInData });
                setUserObj({ ...loggedInData });
                getNotificationCount();
                //setUserRole(loggedInData.roles[0].RoleName);
              }
            })
              .catch(error => {
                setLoggedInUser({ ...defaultUserObj, emailID: 'error' });
                setUserObj({ ...defaultUserObj });
                setUserRole('');
                console.log('user fetching failed.', error);
              });
          }
          //https://pbnamediaannexdev.azurewebsites.net/api/User/GetUserInfo
        })
        .catch(error => {
          setLoggedInUser({ ...defaultUserObj, emailID: 'error' });
          setUserObj({ ...defaultUserObj });
          setUserRole('');
          console.log('authentication failed.', error);
        });
    }
  }, []);

  const changeUserRole = (role) => {
    setLoggedInRole(role);
    setUserRole(role);
    // history.push("/browseInventory");
  }

  const getNotificationCount = () => {
    Axios({
      url: serviceUrlHost + '/api/Notifications/GetNotificationCountForCMM',
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': true
      },
      data: { "LoginUserEmail": getUserEmail() }
    })
      .then((res) => {
        setNotificationCount(res.data.NotificationsCount);
      })
      .catch(error => {
        console.log('fetching notification count', error);
      });
  };

  useEffect(() => {
    getNotificationCount();

    const interval = setInterval(() => {
      getNotificationCount();
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  const MoveToTopElement = (props) => {
    const [scroll, setScroll] = useState('false');

    const listener = e => {
      setScroll('true');
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setScroll('false');
      }, 4000);
    };

    const moveToTop = () => {
      window.scroll({
        top: 0,
        left: 0
      });
    }

    useEffect(() => {
      window.addEventListener("scroll", listener);
      return () => {
        window.removeEventListener("scroll", listener);
      };
    }, []);

    return (
      <div className={scroll == "true" ? 'Show move-top-styling' : 'Hide move-top-styling'}
        onClick={moveToTop}>
        <MoveToTopIcon />
      </div>
    );
  }

  return (
    <React.Fragment>
      {!loggedInUser.emailID && <LoadingMessage />}

      {loggedInUser.emailID === 'error' && <Unauthorized />}

      {loggedInUser.emailID && loggedInUser.emailID !== 'error' && <div data-test="appComponent" className='main-component-style' id="App">
        <ErrorBoundary>
          <Router history={history}>
            <div className="d-none d-md-block">
              <Header user={loggedInUser} changeUserRole={changeUserRole} notificationCount={notificationCount} />
            </div>
            <header className='menu-header d-none d-md-block'>
              <ul className="uldata menu-ul-main">

                {getMenuBasedOnRoleName(loggedInRole, windowWidth).map((obj, index) => {
                  if (obj.DisplayName !== 'Notifications') {
                    return <li key={index} id={'li' + index} className='menu-li-list'>
                      <NavLink to={obj.route} exact={true} activeClassName='active' className='menu-li-link'>
                        <div>
                          <div className='menu-li-link-div-main'>
                            <div className='SVG'> {obj.Icon} </div>
                            <div> {obj.DisplayName} </div>
                          </div>
                        </div>
                      </NavLink>
                    </li>
                  }
                })}
              </ul>
            </header>

            <Navbar collapseOnSelect expand="lg" className="d-block d-sm-none CustomMenu">
              <Navbar.Brand className="Header">
                <Header user={loggedInUser} changeUserRole={changeUserRole} notificationCount={notificationCount} />
              </Navbar.Brand>
              <Navbar.Toggle aria-controls="responsive-navbar-nav" id="NavbarBTN" onClick={blurBack} /> {/* onClick={blurBack} */}
              <Navbar.Collapse id="responsive-navbar-nav">
                <div className="Prfile_Details">
                  <div className="MA_ProfilePicture_container">
                    <img className="MA_ProfilePicture" src={profilePicture} alt="Profile Picture" />
                  </div>
                  <div className="MA_UserName_Role_container">
                    <div className="MA_UserName" onClick={toggle}>
                      {/* <div className="MA_UserName" > */}
                      <span>{userName}</span>
                      <span className="MA_DownArrowIcon">

                        <i ref={arrow} className='fas fa-angle-down'></i>
                      </span>
                    </div>
                    <div className="MA_UserRole">
                      <span>{userRole}</span>
                    </div>
                  </div>
                  <span ref={userOpt}>
                    {/* {showUserOptions &&

                      <div className="MA_UserOptions">
                        {tempUserObj.roles.length > 0 && tempUserObj.roles.map((item) => {
                          if (item.RoleName != userRole) // do not show current user role
                            // return <div className="MA_UserRoles" onClick={() => changeRole(item.RoleName)}>{item.RoleName}</div>
                            return <div className="MA_UserRoles">{item.RoleName}</div>
                        })}
                        <div className="MA_UserRoles" onClick={logout}>Sign out</div>
                      </div>
                    } */}
                  </span>
                  <Navbar.Toggle className="toggle-styling" aria-controls="responsive-navbar-nav" onClick={blurBack}> {/* onClick={blurBack} */}
                    <RemoveIcon style={{ fill: '#272727', opacity: '0.56', height: '14px', width: '14px' }} />
                  </Navbar.Toggle>
                </div>

                <Nav className="mr-auto menuBar" >
                  {getMenuBasedOnRoleName(loggedInRole, windowWidth).map((obj, index) => {
                    if (obj.DisplayName !== 'Notifications') {
                      return (
                        <Navbar.Toggle key={'NavBar' + index}>
                          <Nav.Link key={index} id={'li' + index} className='menu-li-list' onClick={blurBack}>
                            <NavLink to={obj.route} exact={true} activeClassName='active' className='menu-li-link'>
                              <div>
                                <div className='menu-li-link-div-main'>
                                  <div className='SVG'> {obj.Icon} </div>
                                  <div> {obj.DisplayName} </div>
                                </div>
                              </div>
                            </NavLink>
                          </Nav.Link>
                        </Navbar.Toggle>
                      )
                    }
                  })}

                  <Nav.Link className="menu-li-link SignOut menu-styling" onClick={logout}>
                    <div className='SVG signout-styling' > <SignOutIcon /> </div>
                    Sign Out
                  </Nav.Link>
                  <NavDropdown title="Switch Role" id="collasible-nav-dropdown" className='menu-li-link roleSwitch'>

                    {tempUserObj.roles.length > 0 && tempUserObj.roles.map((item, index) => {
                      if (item.RoleName != userRole) // do not show current user role
                        return (<React.Fragment key={index} >
                          <NavDropdown.Item className="MA_UserRoles" onClick={() => changeRole(item.RoleName)}>{item.RoleName}</NavDropdown.Item>
                          <NavDropdown.Divider />
                        </React.Fragment>
                        )
                    })}
                  </NavDropdown>
                </Nav>
              </Navbar.Collapse>
            </Navbar>
            <Suspense fallback={<div className="loading-msg"><LoadingMessage /></div>}>
              <div className="bodyWrapper user-suspense" id="bodyWrapper">
                <Switch>
                  <PrivateRoute path='/createInventory' component={LoadableCreateInventory} role={loggedInRole} getMenuBasedOnRoleName={getMenuBasedOnRoleName} changeUserRole={changeUserRole} />
                  <PrivateRoute path='/browseInventory' component={LoadableBrowseInventory} role={loggedInRole} getMenuBasedOnRoleName={getMenuBasedOnRoleName} changeUserRole={changeUserRole} />
                  <PrivateRoute path='/pendingApprovals' component={LoadablePendingApprovals} role={loggedInRole} getMenuBasedOnRoleName={getMenuBasedOnRoleName} changeUserRole={changeUserRole} />
                  <PrivateRoute path='/dashboard' component={LoadableDashboard} role={loggedInRole} getMenuBasedOnRoleName={getMenuBasedOnRoleName} changeUserRole={changeUserRole} />
                  <PrivateRoute path='/assetDownload' component={LoadableAssetDownload} role={loggedInRole} getMenuBasedOnRoleName={getMenuBasedOnRoleName} changeUserRole={changeUserRole} />
                  <PrivateRoute path='/assetUpload' component={LoadableAssetUpload} role={loggedInRole} getMenuBasedOnRoleName={getMenuBasedOnRoleName} changeUserRole={changeUserRole} />
                  <PrivateRoute path='/workflow' component={LoadableWorkflowReporting} role={loggedInRole} getMenuBasedOnRoleName={getMenuBasedOnRoleName} changeUserRole={changeUserRole} />
                  <PrivateRoute path='/archived' component={LoadableArchived} role={loggedInRole} getMenuBasedOnRoleName={getMenuBasedOnRoleName} changeUserRole={changeUserRole} />
                  <PrivateRoute path='/manageUsers' component={LoadableManageUsers} role={loggedInRole} getMenuBasedOnRoleName={getMenuBasedOnRoleName} changeUserRole={changeUserRole} />
                  <PrivateRoute path='/createCampaign' component={LoadableCreateCampaign} role={loggedInRole} getMenuBasedOnRoleName={getMenuBasedOnRoleName} changeUserRole={changeUserRole} />
                  <PrivateRoute path='/manageCampaign' component={LoadableManageCampaign} role={loggedInRole} getMenuBasedOnRoleName={getMenuBasedOnRoleName} changeUserRole={changeUserRole} />
                  <PrivateRoute path='/home' component={LoadableHome} role={loggedInRole} getMenuBasedOnRoleName={getMenuBasedOnRoleName} changeUserRole={changeUserRole} />
                  <PrivateRoute path='/notifications' component={LoadableNotifications} role={loggedInRole} getMenuBasedOnRoleName={getMenuBasedOnRoleName} changeUserRole={changeUserRole} getNotificationCount={getNotificationCount} />
                  <Route path="/" render={() => {
                    if (!loggedInRole) {
                      return false;
                    }
                    return loggedInRole === Constants.ADMIN
                      ? <Redirect to="/dashboard" />
                      : <Redirect to="/home" />
                  }} />
                </Switch>
              </div>
            </Suspense>
          </Router>
        </ErrorBoundary>
        <MoveToTopElement />
        <Footer />
      </div>}
    </React.Fragment>
  );

}

export default AppRoute;
