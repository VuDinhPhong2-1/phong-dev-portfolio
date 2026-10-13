import { render, screen, act } from "@testing-library/react";
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
