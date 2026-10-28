import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authApi } from './api.js';
import { queryKeys } from '../../lib/queryKeys.js';
import { clearSession, setSession } from '../../store/slices/sessionSlice.js';

export function useSession() {
  const dispatch = useDispatch();
  const query = useQuery({
    queryKey: queryKeys.auth,
    queryFn: authApi.me,
    retry: false,
    staleTime: 5 * 60 * 1000,
    meta: { persist: false },
    throwOnError: false,
  });
  useEffect(() => {
    if (query.data) dispatch(setSession(query.data));
    if (query.isError) dispatch(setSession(null));
  }, [dispatch, query.data, query.isError]);
  return query;
}

export function useAuthMutation(action) {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: action === 'signup' ? authApi.signup : authApi.login,
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.auth, user);
      dispatch(setSession(user));
      navigate(user.onboardingDone ? '/app' : '/onboarding');
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: async () => {
      await queryClient.cancelQueries();
      queryClient.clear();
      dispatch(clearSession());
      navigate('/');
    },
  });
}
