import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ReferencePlannerNoticePage } from "@/features/cluster-designer/pages/ReferencePlannerNoticePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <ReferencePlannerNoticePage />,
      },
    ],
  },
]);
