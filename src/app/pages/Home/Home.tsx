import { useEffect, useState } from "react";
import { getWeather } from "../../../api/home/homeApi";
import { Card, Row, Col, Typography, Collapse } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import backgroundHcmCity from "../../assets/backgroundhcmcity.png";
import { MetroLineApi } from "../../../api/metroLine/MetroLineApi";
import metroMap from '../../assets/Metro Map.png';
import type { GetMetroLineDTO } from "../../../api/metroLine/MetroLineInterface";
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import NewsListCustomer from './partials/News/NewsListCustomer';
import { checkUserRole } from "../../../api/auth/auth";
import { Navigate } from "react-router-dom";

const { Title, Text } = Typography;
const API_KEY = import.meta.env.VITE_OPENWEATHER_KEY;
const CITY_NAME = "Ho Chi Minh";

export default function Home() {
  const [time, setTime] = useState(new Date());
  const [temperature, setTemperature] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    metroLines: 0,
    operatingHours: "5:00 - 23:00"
  });

  // New state for fetched metro lines
  const [metroLines, setMetroLines] = useState<GetMetroLineDTO[]>([]); // Array of metro line objects

  if (checkUserRole(["STAFF"])) {
        return <Navigate to="/staff" replace />;
  }

  if (checkUserRole(["MANAGER"])) {
        return <Navigate to="/manager" replace />;
  }

  if (checkUserRole(["ADMIN"])) {
        return <Navigate to="/admin" replace />;
  }

  // Personalization: get username from localStorage
  const [username, setUsername] = useState<string | null>(null);
  useEffect(() => {
    setUsername(localStorage.getItem('username'));
  }, []);



  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const metroLinesRes = await MetroLineApi.getAllMetroLines();

        setStats({
          metroLines: metroLinesRes.result?.length || 0,
          operatingHours: "5:00 - 23:00"
        });

        // Set metro lines from API
        setMetroLines(metroLinesRes.result || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    getWeather(CITY_NAME, API_KEY)
      .then((temp) => {
        setTemperature(temp);
      })
      .catch((err) => {
        console.error("Error fetching weather:", err);
      });
  }, []);

  const now = time.toLocaleTimeString();
  const today = time.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

  // State to toggle Metro Map visibility
  const [showMap, setShowMap] = useState(false);

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Hero Section */}
      <div 
        className="relative h-[400px] bg-cover bg-center"
        style={{
          backgroundImage: `url(${backgroundHcmCity})`,
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative h-full flex flex-col items-center justify-center text-white px-4">
          <Title level={1} className="text-5xl font-bold text-center drop-shadow-md" style={{ color: 'white' }}>
            {username ? `Chào mừng, ${username}!` : 'Chào Mừng Đến Với HCMC Metro'}
          </Title>
          <Text className="mt-4 text-lg text-center bg-black/40 px-4 py-2 rounded-md inline-block" style={{ color: 'white' }}>
            {today} | {now}
          </Text>
          <div className="mt-2 text-white text-center">
            <EnvironmentOutlined className="mr-2" />
            <span>
              Nhiệt độ:{" "}
              {temperature !== null
                ? `${(temperature * 1).toFixed(1)}°C / ${(temperature * 1.8 + 32).toFixed(0)}°F`
                : "Loading..."}
            </span>
            <span className="ml-2">Thành phố Hồ Chí Minh</span>
          </div>
        </div>
      </div>

      {/* Metro Map Toggle Button and Section */}
      <div className="max-w-7xl mx-auto px-4 pb-6 flex flex-col items-center mt-8">
        <button
          className="mb-4 px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-full shadow transition-all duration-200"
          onClick={() => setShowMap((prev) => !prev)}
        >
          {showMap ? 'Ẩn bản đồ Metro' : 'Xem bản đồ Metro'}
        </button>
        {showMap && (
          <div className="w-full">
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
              <h2 className="text-blue-700 font-bold text-3xl mb-4">Bản đồ HCMC Metro</h2>
              <div className="w-full max-w-2xl h-auto border border-blue-200 rounded overflow-hidden bg-gray-50">
                <TransformWrapper
                  initialScale={1}
                  minScale={0.7}
                  maxScale={3}
                  doubleClick={{ disabled: true }}
                >
                  {({ zoomIn, zoomOut, resetTransform }) => (
                    <>
                      <div className="flex gap-2 mb-2 justify-end">
                        <button className="px-2 py-1 bg-blue-100 rounded hover:bg-blue-200" onClick={() => zoomIn()} aria-label="Phóng to">+</button>
                        <button className="px-2 py-1 bg-blue-100 rounded hover:bg-blue-200" onClick={() => zoomOut()} aria-label="Thu nhỏ">-</button>
                        <button className="px-2 py-1 bg-blue-100 rounded hover:bg-blue-200" onClick={() => resetTransform()} aria-label="Đặt lại">Reset</button>
                      </div>
                      <TransformComponent>
                        <img
                          src={metroMap}
                          alt="Bản đồ HCMC Metro"
                          className="w-full h-auto select-none"
                          style={{ objectFit: 'contain', pointerEvents: 'all' }}
                        />
                      </TransformComponent>
                    </>
                  )}
                </TransformWrapper>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* News Section */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <NewsListCustomer />
      </div>

      {/* FAQ Section */}
      <div className="max-w-7xl mx-auto px-4 pb-8 bg-[#f7f4f0]">
        <div className="pt-8 pb-4">
          <h2 className="text-blue-700 font-bold text-4xl mb-4">Câu Hỏi Thường Gặp</h2>
          <Collapse
            accordion
            bordered={false}
            expandIconPosition="start"
            className="bg-transparent"
            style={{ background: "transparent" }}
            items={[
              {
                key: '1',
                label: <span className="text-lg font-medium">Lịch hoạt động tuyến Metro </span>,
                children: (
                  <div className="text-base text-gray-700 pl-2 pt-2">
                    Tuyến Metro hoạt động từ <b>5:00 sáng đến 23:00 tối</b> mỗi ngày. Tần suất tàu chạy dự kiến từ 5-10 phút/chuyến vào giờ cao điểm và 10-15 phút/chuyến vào giờ bình thường.
                  </div>
                ),
              },
              {
                key: '2',
                label: <span className="text-lg font-medium">Giá vé đi tàu cho học sinh/sinh viênviên ?</span>,
                children: (
                  <div className="text-base text-gray-700 pl-2 pt-2">
                    Giao vé tàu cho sẽ được ưu đãi đối với học sinh/sinh viên đã đăng ký và được phê duyệt sẽ được giảm giá lên đến <b>50%.</b>
                  </div>
                ),
              },
              {
                key: '3',
                label: <span className="text-lg font-medium">Ai được hỗ trợ 100% giá vé ?</span>,
                children: (
                  <div className="text-base text-gray-700 pl-2 pt-2">
                    Đối tượng được miễn 100% giá vé gồm: <b>trẻ em dưới 6 tuổi, người khuyết tật đặc biệt nặng, người có công với cách mạng, cán bộ lão thành cách mạng</b> và các trường hợp theo quy định của thành phố.
                  </div>
                ),
              },
              {
                key: '4',
                label: <span className="text-lg font-medium">Kích thước hành lý được phép mang lên tàu ?</span>,
                children: (
                  <div className="text-base text-gray-700 pl-2 pt-2">
                    Hành khách được mang theo hành lý cá nhân với kích thước tối đa <b>60cm x 40cm x 20cm</b> và tổng trọng lượng không quá <b>20kg</b>. Không được mang vật nuôi, hàng hóa nguy hiểm hoặc cồng kềnh lên tàu.
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>

      {/* Quick Info Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Card title="Về HCMC Metro">
              <p>
                HCMC Metro là hệ thống đường sắt nhanh nhất ở Thành phố Hồ Chí Minh, Việt Nam.
                Hệ thống được thiết kế để giảm thiểu tắc nghẽn giao thông và cung cấp một giải pháp vận tải hiện đại, hiệu quả cho các cư dân thành phố.
              </p>
              <p className="mt-4">
                Hiện đang vận hành {stats.metroLines} tuyến đường với các ga, hệ thống metro
                cung cấp một phương tiện di chuyển an toàn, tiện lợi và hiện đại cho người dân thành phố.
              </p>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Điều khoản sử dụng">
              <ul className="list-disc pl-5 text-gray-700 text-base">
                <li>Hành khách cần tuân thủ các quy định về an toàn và trật tự khi sử dụng dịch vụ Metro.</li>
                <li>Không mang theo vật nuôi, hàng hóa nguy hiểm hoặc cồng kềnh lên tàu.</li>
                <li>Giữ gìn vệ sinh chung, không xả rác bừa bãi trong khu vực nhà ga và trên tàu.</li>
                <li>Tuân thủ hướng dẫn của nhân viên Metro và các biển báo tại nhà ga.</li>
                <li>Vi phạm điều khoản có thể bị từ chối phục vụ hoặc xử lý theo quy định pháp luật.</li>
              </ul>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
