import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faLock,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, isFirebaseConfigured } from "../../services/firebase";

export default function AdminLoginView({ user, isAdminUser, authReady }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isFirebaseConfigured) {
    return (
      <main className="adm-dashboard-root" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="adm-modal-box" style={{ textAlign: "center" }}>
          <FontAwesomeIcon icon={faLock} style={{ fontSize: 36, color: "#f43f5e", marginBottom: 12 }} />
          <h3>Firebase chưa được cấu hình</h3>
          <p>Vui lòng cấu hình các biến môi trường Firebase trong file .env.</p>
        </div>
      </main>
    );
  }

  if (!authReady) {
    return (
      <main className="adm-dashboard-root" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#818cf8", fontSize: 16, fontWeight: 600 }}>
          ⏳ Đang kết nối xác thực Quản trị viên...
        </div>
      </main>
    );
  }

  if (user && !isAdminUser) {
    return (
      <main className="adm-dashboard-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div className="adm-modal-box" style={{ textAlign: "center" }}>
          <FontAwesomeIcon icon={faShieldHalved} style={{ fontSize: 36, color: "#f59e0b", marginBottom: 12 }} />
          <h3>Admin Access Only</h3>
          <p>Tài khoản {user.email} không có quyền truy cập Dashboard Quản trị viên.</p>
          <button type="button" className="adm-btn-sec" onClick={() => signOut(auth)}>
            <FontAwesomeIcon icon={faArrowRightFromBracket} /> Đăng xuất
          </button>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setPassword("");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="adm-dashboard-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="adm-modal-box" style={{ maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div className="adm-brand-logo" style={{ margin: "0 auto 12px" }}>🛡️</div>
          <h2 style={{ color: "#fff", margin: "0 0 6px", fontSize: 20 }}>Admin Console</h2>
          <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>Đăng nhập quản trị viên để mở bảng điều khiển.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 4 }}>Email Admin</label>
            <input
              type="email"
              className="adm-search-input"
              style={{ width: "100%", boxSizing: "border-box" }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 4 }}>Mật khẩu</label>
            <input
              type="password"
              className="adm-search-input"
              style={{ width: "100%", boxSizing: "border-box" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {errorMsg && (
            <div style={{ color: "#f87171", fontSize: 12, background: "rgba(239,68,68,0.1)", padding: 8, borderRadius: 6 }}>
              {errorMsg}
            </div>
          )}

          <button type="submit" className="adm-btn-primary" style={{ justifyContent: "center", marginTop: 4 }} disabled={isSubmitting}>
            {isSubmitting ? "Đang xác thực..." : "Đăng nhập Dashboard"}
          </button>
        </form>
      </div>
    </main>
  );
}
