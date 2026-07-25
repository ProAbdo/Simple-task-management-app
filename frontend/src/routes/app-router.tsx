import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import App from '@/App';
import {
  GuestRoute,
  ProtectedRoute,
  RootRedirect,
} from '@/features/auth/auth-guard';
import { AuthLayout } from '@/features/auth/components/auth-layout';
import { TaskWorkspaceLayout } from '@/features/tasks/components/task-workspace-layout';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <RootRedirect />,
      },
      {
        element: <GuestRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              {
                path: 'login',
                lazy: async () => {
                  const { LoginPage } =
                    await import('@/features/auth/pages/login-page');

                  return { Component: LoginPage };
                },
              },
              {
                path: 'register',
                lazy: async () => {
                  const { RegisterPage } =
                    await import('@/features/auth/pages/register-page');

                  return { Component: RegisterPage };
                },
              },
            ],
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'app',
            element: <TaskWorkspaceLayout />,
            children: [
              {
                index: true,
                lazy: async () => {
                  const { TaskListPage } =
                    await import('@/features/tasks/pages/task-list-page');

                  return { Component: TaskListPage };
                },
              },
              {
                path: 'tasks/:taskId',
                lazy: async () => {
                  const { TaskDetailsPage } =
                    await import('@/features/tasks/pages/task-details-page');

                  return { Component: TaskDetailsPage };
                },
              },
            ],
          },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
