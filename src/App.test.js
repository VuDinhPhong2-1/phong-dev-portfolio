import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import App from "./App";
import store from "./redux/store";

beforeEach(() => {
  window.location.hash = "";
  window.scrollTo = jest.fn();
});

test("renders updated portfolio headline", () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>,
  );

  expect(
    screen.getByRole("heading", { name: /vu dinh phong/i, level: 1 }),
  ).toBeInTheDocument();
  expect(
    screen.getAllByText(/(coding online teacher|giáo viên coding online)/i).length,
  ).toBeGreaterThan(0);
});

test("renders NGL link that targets a new tab", () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>,
  );

  const nglLinks = screen.getAllByRole("link", { name: /hỏi ẩn danh/i });
  expect(nglLinks.length).toBeGreaterThan(0);
  expect(nglLinks[0]).toHaveAttribute("target", "_blank");
});

test("hero calls to action navigate to projects and contact", () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>,
  );

  fireEvent.click(screen.getByLabelText("Switch to English"));
  fireEvent.click(screen.getByRole("button", { name: /view projects/i }));
  fireEvent.click(screen.getByRole("button", { name: /contact me/i }));

  expect(window.scrollTo).toHaveBeenCalledTimes(2);
  expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: "smooth" });
});

test("switches the portfolio language to English", () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>,
  );

  fireEvent.click(screen.getByLabelText("Switch to English"));

  expect(screen.getAllByText(/coding online teacher/i).length).toBeGreaterThan(0);
  expect(screen.getByRole("button", { name: /view projects/i })).toBeInTheDocument();
});

test("mobile navigation exposes its expanded state", () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>,
  );

  const menuButton = screen.getByRole("button", { name: /open navigation/i });
  expect(menuButton).toHaveAttribute("aria-expanded", "false");

  fireEvent.click(menuButton);

  expect(screen.getByRole("button", { name: /close navigation/i })).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  expect(document.getElementById("portfolio-navigation")).toHaveClass("active");
});

test("renders NGL standalone page when hash is #/ngl", () => {
  window.location.hash = "#/ngl";

  render(
    <Provider store={store}>
      <App />
    </Provider>,
  );

  expect(screen.getByText(/gửi tin nhắn ẩn danh/i)).toBeInTheDocument();
  expect(screen.getByText(/hộp thư của tôi/i)).toBeInTheDocument();
  expect(screen.getByText(/không công khai câu hỏi này/i)).toBeInTheDocument();

  // Reset hash back to default
  window.location.hash = "";
});

test("renders floating NGL bubble on home page", () => {
  window.location.hash = "";

  render(
    <Provider store={store}>
      <App />
    </Provider>,
  );

  expect(screen.getByLabelText(/nhắn tin ẩn danh/i)).toBeInTheDocument();
  expect(screen.getByTitle(/gửi câu hỏi ẩn danh ngl/i)).toBeInTheDocument();
});

test("renders admin view when hash is #/admin", () => {
  window.location.hash = "#/admin";

  render(
    <Provider store={store}>
      <App />
    </Provider>,
  );

  expect(
    screen.getByText(/firebase chưa được cấu hình|admin dashboard/i),
  ).toBeInTheDocument();

  window.location.hash = "";
});

test("renders privacy and data deletion routes", () => {
  window.location.hash = "#/privacy";

  const privacyView = render(
    <Provider store={store}>
      <App />
    </Provider>,
  );

  expect(screen.getByRole("heading", { name: /privacy policy/i, level: 1 })).toBeInTheDocument();
  privacyView.unmount();

  window.location.hash = "#/data-deletion";

  render(
    <Provider store={store}>
      <App />
    </Provider>,
  );

  expect(screen.getByRole("heading", { name: /user data deletion/i, level: 1 })).toBeInTheDocument();
});
