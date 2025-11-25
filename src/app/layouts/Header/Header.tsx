import {
  LoginOutlined, UserAddOutlined, ApartmentOutlined,
  DockerOutlined,
  OrderedListOutlined,
  UnorderedListOutlined
} from "@ant-design/icons";
import { Button, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import logoImg from "../../assets/logo.png";
import TicketServiceMenu from "./partials/TicketServiceMenu";
import UserHeaderMenu from "./partials/UserHeaderMenu";
import { useState, useEffect } from "react";
import { MetroLineApi } from "../../../api/metroLine/MetroLineApi";
import type { GetMetroLineDTO } from "../../../api/metroLine/MetroLineInterface";

const defaultColors = [
  "#FFA500", // orange
  "#FF3B30", // red
  "#4A90E2", // blue
  "#50E3C2", // teal
  "#B8E986", // light green
  "#BD10E0", // purple
  "#7ED321", // green
  "#A0522D", // brown
];
const defaultIcons = [
  "/stations/icon_t01.png",
  "/stations/icon_t02.png",
  "/stations/icon_t03.png",
  "/stations/icon_t04.png",
  "/stations/icon_t05.png",
  "/stations/icon_t06.png",
  "/stations/icon_t07.png",
  "/stations/icon_t08.png",
  "/stations/icon_t09.png",
  "/stations/icon_t10.png",
  "/stations/icon_t11.png",
  "/stations/icon_t12.png",
];

const statusMap = {
  0: { text: "Hoạt động bình thường", color: "text-green-500" }, // Normal
  1: { text: "Bị lỗi", color: "text-red-500" },                  // Faulty
  2: { text: "Bị chậm", color: "text-yellow-500" },              // Delayed
};

export default function Header() {
  const navigate = useNavigate();
  const storedUserInfo = localStorage.getItem("userInfo");
  const userInfo = storedUserInfo ? JSON.parse(storedUserInfo) : null;
  const [isMetroStatusModalOpen, setIsMetroStatusModalOpen] = useState(false);
  const [metroLines, setMetroLines] = useState<GetMetroLineDTO[]>([]);
  const [metroLinesLoading, setMetroLinesLoading] = useState(true);

  const [isTestAccountsModalOpen, setIsTestAccountsModalOpen] = useState(false);

  const testAccounts = [
    {
      email: "admin@example.com",
      password: "123456Admin@",
      role: "Admin",
    },
    {
      email: "staff@example.com",
      password: "Hieu@123456",
      role: "Staff",
    },
    {
      email: "manager@example.com",
      password: "Hoa@123456",
      role: "Manager",
    },
    {
      email: "user@example.com",
      password: "Hoa@123456",
      role: "Customer",
    },
  ];

  useEffect(() => {
    const fetchMetroLines = async () => {
      try {
        setMetroLinesLoading(true);
        const res = await MetroLineApi.getAllMetroLines();
        setMetroLines(res.result || []);
      } catch (err) {
        setMetroLines([]);
      } finally {
        setMetroLinesLoading(false);
      }
    };
    fetchMetroLines();
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 flex justify-between  px-6 py-3 shadow-md bg-white h-20">
        <a className="w-45" href="/">
          <img src={logoImg} alt="" />
        </a>

        <div className="flex gap-3">

          <Button
            type="default"
            icon={<ApartmentOutlined className="text-xl" />}
            className="flex items-center gap-2 px-4 border-blue-900 text-blue-900 hover:!bg-blue-900 hover:!text-white transition-colors rounded-lg shadow-sm !h-auto"
            onClick={() => setIsMetroStatusModalOpen(true)}
          >
            <span className="hidden sm:text-sm sm:inline">Trạng thái tuyến Metro</span>
          </Button>
          <Button
            type="default"
            icon={<ApartmentOutlined className="text-xl" />}
            className="flex items-center gap-2 px-4 border-blue-900 text-blue-900 hover:!bg-blue-900 hover:!text-white transition-colors rounded-lg shadow-sm !h-auto"
            onClick={() => navigate('/metro-line')}
          >
            <span className="hidden sm:text-sm sm:inline">Tuyến Metro</span>
          </Button>

          <Button
            type="default"
            className="flex items-center gap-2 px-4 border-blue-900 text-blue-900 hover:!bg-blue-900 hover:!text-white transition-colors rounded-lg shadow-sm !h-auto"
            onClick={() => setIsTestAccountsModalOpen(true)}
            icon={<UnorderedListOutlined className="text-xl" />}
          >
            <span className="hidden sm:text-sm sm:inline text-red-700">Danh sách tài khoản Test</span>
          </Button>

          {!userInfo ? (
            <>
              {[
                { label: "Đăng nhập", icon: <LoginOutlined className="text-xl" />, path: "/login" },
                { label: "Đăng ký", icon: <UserAddOutlined className="text-xl" />, path: "/register" },
              ].map(({ label, icon, path }) => (
                <Button
                  key={label}
                  type="default"
                  icon={icon}
                  onClick={() => navigate(path)}
                  className="flex items-center gap-2 px-4 border-blue-900 text-blue-900 hover:!bg-blue-900 hover:!text-white transition-colors rounded-lg shadow-sm !h-auto"
                >
                  <span className="hidden sm:text-sm sm:inline">{label}</span>
                </Button>
              ))}
            </>
          ) : (
            <>
              <TicketServiceMenu />
              <UserHeaderMenu userInfo={userInfo} />
            </>
          )}

        </div>
      </header>

      <Modal
        title={<span className="text-blue-700 font-bold text-2xl">Trạng thái tuyến Metro</span>}
        open={isMetroStatusModalOpen}
        onCancel={() => setIsMetroStatusModalOpen(false)}
        footer={null}
        width={700}
        centered
      >
        <div className="flex flex-wrap gap-6 justify-center py-4">
          {metroLinesLoading ? (
            <div className="text-center text-gray-500 py-8 w-full">Đang tải trạng thái tuyến Metro...</div>
          ) : (
            metroLines
              .slice()
              .sort((a, b) => Number(a.metroLineNumber) - Number(b.metroLineNumber))
              .map((line, idx) => {
                const color = defaultColors[idx % defaultColors.length];
                const icon = defaultIcons[idx % defaultIcons.length];
                const statusInfo = statusMap[line.status] || { text: "Không xác định", color: "text-gray-500" };
                return (
                  <div
                    key={line.id}
                    className="bg-white rounded-xl shadow p-4 flex flex-col items-center w-40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    style={{ minWidth: 150 }}
                    tabIndex={0}
                    aria-label={`Thông tin ${line.metroName || `Tuyến Số ${line.metroLineNumber}`}`}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                      style={{ background: color }}
                    >
                      <img src={icon} alt={line.metroName || `Tuyến Số ${line.metroLineNumber}`} className="w-8 h-8" />
                    </div>
                    <div className="font-bold text-blue-700 text-base mb-1 text-center w-full">
                      {line.metroName || `Tuyến Số ${line.metroLineNumber}`}
                    </div>
                    <div className={`${statusInfo.color} text-2xl mb-1`} aria-label="Trạng thái hoạt động">●</div>
                    <div className="text-gray-900 text-sm text-center">{statusInfo.text}</div>
                  </div>
                );
              })
          )}
        </div>
      </Modal>

      <Modal
        title={<span className="text-blue-700 font-bold text-2xl">Danh sách tài khoản Test</span>}
        open={isTestAccountsModalOpen}
        onCancel={() => setIsTestAccountsModalOpen(false)}
        footer={null}
        width={800}
        centered
      >
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="border-b border-gray-200 px-4 py-2 text-left font-semibold">#</th>
                <th className="border-b border-gray-200 px-4 py-2 text-left font-semibold">Email</th>
                <th className="border-b border-gray-200 px-4 py-2 text-left font-semibold">Password</th>
                <th className="border-b border-gray-200 px-4 py-2 text-left font-semibold">Role</th>
              </tr>
            </thead>
            <tbody>
              {testAccounts.map((acc, index) => (
                <tr key={acc.email} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="border-b border-gray-200 px-4 py-2">{index + 1}</td>
                  <td className="border-b border-gray-200 px-4 py-2 font-mono">{acc.email}</td>
                  <td className="border-b border-gray-200 px-4 py-2 font-mono">{acc.password}</td>
                  <td className="border-b border-gray-200 px-4 py-2">{acc.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-red-600">
            * Mọi thắc mắc hoặc cần hỗ trợ vui lòng liên hệ zalo: 0326336224 (Hiệu)
          </p>
        </div>
      </Modal>
    </>
  );
}
