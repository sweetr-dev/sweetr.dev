import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { queryClient } from "./api/clients/query-client";
import { router } from "./routes";
import "@mantine/core/styles.css";
import "@mantine/spotlight/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/dates/styles.css";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <MantineProvider
    defaultColorScheme="dark"
    theme={createTheme({
      cursorType: "pointer",

      primaryColor: "green",
      colors: {
        // Default Mantine dark colors from before 7.3.0
        dark: [
          "#C1C2C5",
          "#A6A7AB",
          "#909296",
          "#5C5F66",
          "#373A40",
          "#2C2E33",
          "#25262B",
          "#1A1B1E",
          "#141517",
          "#101113",
        ],
      },
    })}
  >
    <QueryClientProvider client={queryClient}>
      <Notifications />
      <RouterProvider router={router} />
    </QueryClientProvider>
  </MantineProvider>,
);
