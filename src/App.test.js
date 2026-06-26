import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import App from "./App";
import store from "./redux/store";

test("renders updated portfolio headline", () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>,
  );

  expect(
    screen.getByRole("heading", { name: /vu dinh phong portfolio/i, level: 1 }),
  ).toBeInTheDocument();
  expect(
    screen.getAllByText(/coding online teacher \| mos 2019 instructor/i).length,
  ).toBeGreaterThan(0);
});
