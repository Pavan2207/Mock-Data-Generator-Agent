import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/layouts/RootLayout";
import { HomePage } from "./pages/HomePage";
import { SchemaEditorPage } from "./pages/SchemaEditorPage";
import { GeneratorPage } from "./pages/GeneratorPage";
import { HistoryPage } from "./pages/HistoryPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TeamsPage } from "./pages/TeamsPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "schema", Component: SchemaEditorPage },
      { path: "generate", Component: GeneratorPage },
      { path: "history", Component: HistoryPage },
      { path: "settings", Component: SettingsPage },
      { path: "teams", Component: TeamsPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);
