import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { PageShell } from './components/layout/PageShell';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { PaycheckCalculatorPage } from './pages/PaycheckCalculatorPage';
import { PostTaxAllocationsPage } from './pages/PostTaxAllocationsPage';
import { BudgetCategoriesPage } from './pages/BudgetCategoriesPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { SummaryPage } from './pages/SummaryPage';
import { PurchaseLogPage } from './pages/PurchaseLogPage';
import { CategoryDetailPage } from './pages/CategoryDetailPage';

export const router = createBrowserRouter(
  [
    { path: '/login', element: <AuthPage /> },
    {
      element: <ProtectedRoute />,
      children: [
        { path: '/onboarding', element: <OnboardingPage /> },
        {
          element: <PageShell />,
          children: [
            { path: '/paycheck', element: <PaycheckCalculatorPage /> },
            { path: '/allocations', element: <PostTaxAllocationsPage /> },
            { path: '/categories', element: <BudgetCategoriesPage /> },
            { path: '/categories/:categoryId', element: <CategoryDetailPage /> },
            { path: '/subscriptions', element: <SubscriptionsPage /> },
            { path: '/purchases', element: <PurchaseLogPage /> },
            { path: '/summary', element: <SummaryPage /> },
          ],
        },
      ],
    },
    { path: '/', element: <Navigate to="/paycheck" replace /> },
    { path: '*', element: <Navigate to="/paycheck" replace /> },
  ],
  { basename: '/Budget-Maxxing' }
);
