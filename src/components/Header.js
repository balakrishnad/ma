import React, { useState, useRef, useEffect } from 'react';
import { Badge } from 'react-bootstrap';
import './Header.css';
import useOnClickOutside from './common/OutsideHandler';
import { BellIcon, ArrowDownIcon } from './common';
import profilePicSmall from '../styles/images/profile-pic-small.png';
import { serviceUrlHost } from '../utils/apiUrls';
import { getUserRole, clearUser, getUserEmail } from '../utils/userRolehelper';
import { useHistory } from 'react-router-dom';

export default ({ user, changeUserRole, notificationCount }) => {
    const history = useHistory();
    const [showUserOptions, setShowUserOptions] = useState(false);
    const userOpt = useRef();
    const arrow = useRef();
    const headerLogo = serviceUrlHost + '/PBNA-Logo.png';/*require("../PBNA Logo FINAL.png");*/
    const profilePicture = (!user.Picture) ? profilePicSmall : "data:image/png;base64," + user.Picture; /*require("../user-ashley-mason.jpg");*/
    const userName = user.firstName + ' ' + user.lastName || "";
    const userRole = getUserRole();
   
    const toggle = () => {
        setShowUserOptions(!showUserOptions);
        if (showUserOptions) {
            arrow.current.classList.remove('fa-angle-up');
        } else {
            arrow.current.classList.add('fa-angle-up');
        }
    }
    const logout = () => {
        toggle();
        clearUser();
        window.location.replace(serviceUrlHost + "/.auth/logout");
    }

    const changeRole = (role) => {
        toggle();
        changeUserRole(role);
    }

    useOnClickOutside(userOpt, () => {
        arrow.current.classList.remove('fa-angle-up');
        return setShowUserOptions(false);
    });
    const showNotifications = () => {
        // console.log('show notifications');
        history.push('./notifications');
    };

    return (
        <div className="MA_Header">
            <div className="MA_Logo ">
                <img className="d-none d-md-block" src={headerLogo} alt="Pepsico Logo" />
            </div>
            <div className="MA_Header_Title_Wrapper">
                <span className="MA_HeaderTitle_1">Media</span>
                <span className="MA_HeaderTitle_2">Annex</span>
            </div>
            <div className="MA_Header_Right">
                <div className="MA_Notification_Icon_Wrapper" onClick={showNotifications}>
                    <span className="MA_Notification_Icon">
                        <BellIcon className='BellIcon' />
                    </span>
                    <span className="bellicon-notification"><Badge pill variant="success">{notificationCount}</Badge></span>
                </div>
                <div className="MA_UserProfile_Wrapper d-none d-md-block">
                    {userName && userRole  &&
                        <div className="MA_UserProfile">
                            <div className="MA_ProfilePicture_container">
                                <img className="MA_ProfilePicture" src={profilePicture} alt="Profile Picture" />
                            </div>
                            <div className="MA_UserName_Role_container">
                                <div className="MA_UserName" onClick={toggle}>
                                    <span>{userName}</span>
                                    <span className="MA_DownArrowIcon">
                                        {/* <ArrowDownIcon className='ArrowDown'/> */}
                                        <i ref={arrow} className='fas fa-angle-down'></i>
                                    </span>
                                </div>
                                <div className="MA_UserRole">
                                    <span>{userRole}</span>
                                </div>
                            </div>
                            
                            <span ref={userOpt}>
                                { showUserOptions && 
                                    <div className="MA_UserOptions">
                                        
                                        { user.roles.length > 0 && user.roles.map((item) => {
                                            if(item.RoleName != userRole) // do not show current user role
                                                return <div className="MA_UserRoles" onClick ={()=> changeRole(item.RoleName)}>{item.RoleName}</div>  
                                        })}
                                        <div className="MA_UserRoles" onClick={logout}>Sign out</div>
                                    </div>
                                }
                            </span>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
}