import { Provider } from "./components/ui/provider";
import { Theme } from "@chakra-ui/react";

import AppRouter from "./routes/AppRouter";

function App() {
  return (
    <>
      <Provider>
        <Theme appearance="light" colorPalette="indigo">
          <AppRouter />
        </Theme>
      </Provider>
    </>
  );
}

export default App;
