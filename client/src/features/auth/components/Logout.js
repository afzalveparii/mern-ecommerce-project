import { useEffect } from 'react';
import { selectLoggedInUser, signOutAsync } from '../authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function Logout() {
  const dispatch = useDispatch();
  const user = useSelector(selectLoggedInUser);
  const navigate = useNavigate();
  useEffect(() => {
    dispatch(signOutAsync());
    if (!user) {
    navigate('/login');
    }
  });

  // but useEffect runs after render, so we have to delay navigate part
 
  
}

export default Logout;
