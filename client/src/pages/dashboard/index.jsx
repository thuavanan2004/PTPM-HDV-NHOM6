import React, { useEffect, useState } from 'react';
import './style.scss';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { Chart, ArcElement, BarElement, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { get } from '../../utils/axios-http/axios-http';


Chart.register(ArcElement, BarElement, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

function Dashboard() {
    const [dashboardTours, setDashboardTours] = useState(null);
    const [dashboardOders, setDashboardOders] = useState(null);

    useEffect(() => {
        const fetchDashboardTours = async () => {
            const response = await get('statistics/tours');
            setDashboardTours(response);
        };
        fetchDashboardTours();
    }, []);

    useEffect(() => {
        const fetchDashboardOders = async () => {
            const response = await get('statistics/orders');
            setDashboardOders(response);
        };
        fetchDashboardOders();
    }, []);

    if (!dashboardTours && !dashboardOders) return <div>Loading...</div>;

    const tourStatusData = {
        labels: ['Hoạt động', 'Không hoạt động'],
        datasets: [
            {
                data: [dashboardTours.activeTours, dashboardTours.inactiveTours],
                backgroundColor: ['#36A2EB', '#FF6384'],
                hoverBackgroundColor: ['#36A2EB', '#FF6384']
            }
        ]
    };

    const monthlyStatsData = {
        labels: dashboardTours?.monthlyStats?.map(stat => `Tháng ${stat.month}/${stat.year}`).reverse() || [],
        datasets: [
            {
                label: 'Số lượng',
                data: dashboardTours?.monthlyStats?.map(stat => stat.count).reverse() || [],
                fill: false,
                borderColor: '#42A5F5',
                pointBackgroundColor: '#42A5F5'
            }
        ]
    };

    const weeklyStatsData = {
        labels: dashboardTours?.weeklyStats?.map(stat => `Tuần ${stat.week}/${stat.year}`).reverse() || [],
        datasets: [
            {
                label: 'Số lượng',
                data: dashboardTours?.weeklyStats?.map(stat => stat.count).reverse() || [],
                fill: false,
                borderColor: '#66BB6A',
                pointBackgroundColor: '#66BB6A'
            }
        ]
    };


    const orderStatusData = {
        labels: ['Đang chờ', 'Đã xác nhận', 'Đã hủy'],
        datasets: [
            {
                data: [dashboardOders?.pendingOrders, dashboardOders?.confirmedOrders, dashboardOders?.canceledOrders],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCD56'],
                hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCD56']
            }
        ]
    };

    const monthlyRevenueData = {
        labels: dashboardOders?.revenueByMonth?.map(item => `Tháng ${item.month}/${item.year}`).reverse() || [],
        datasets: [
            {
                label: 'Doanh thu',
                data: dashboardOders?.revenueByMonth?.map(item => parseFloat(item.revenue)).reverse() || [],
                fill: false,
                borderColor: '#42A5F5',
                pointBackgroundColor: '#42A5F5'
            }
        ]
    };

    const weeklyRevenueData = {
        labels: dashboardOders?.revenueByWeek?.map(item => `Tuần ${item.week}/${item.year}`).reverse() || [],
        datasets: [
            {
                label: 'Doanh thu',
                data: dashboardOders?.revenueByWeek?.map(item => parseFloat(item.revenue)).reverse() || [],
                fill: false,
                borderColor: '#66BB6A',
                pointBackgroundColor: '#66BB6A'
            }
        ]
    };

    const paymentMethodRevenueData = {
        labels: dashboardOders?.revenueByPaymentMethod?.map(item => item.paymentMethod).reverse() || [],
        datasets: [
            {
                data: dashboardOders?.revenueByPaymentMethod?.map(item => parseFloat(item.revenue)).reverse() || [],
                backgroundColor: ['#FF6384', '#36A2EB'],
                hoverBackgroundColor: ['#FF6384', '#36A2EB']
            }
        ]
    };

    const cancellationRateData = {
        labels: dashboardOders?.cancellationRate?.map(item => `Tháng ${item.month}/${item.year}`).reverse() || [],
        datasets: [
            {
                label: 'Tỷ lệ hủy',
                data: dashboardOders?.cancellationRate?.map(item => parseFloat(item.cancelRate)).reverse() || [],
                backgroundColor: '#FFCA28',
                borderColor: '#FFCA28',
                borderWidth: 1
            }
        ]
    };

    return (
        <div className="dashboard-container">
            <div className="tour-statistics">
                <h2>Thống kê Tours</h2>
                <div className="chart">
                    <div className="chart-doughnut">
                        <h3>Trạng thái Tour</h3>
                        <Doughnut className='doughnut' data={tourStatusData} />
                    </div>
                    <div className="chart-line">
                        <div className="chart-section">
                            <h3>Thống kê hàng tháng</h3>
                            <Line className='line' data={monthlyStatsData} />
                        </div>

                        <div className="chart-section">
                            <h3>Thống kê hàng tuần</h3>
                            <Line className='line' data={weeklyStatsData} />
                        </div>
                    </div>
                </div>
                <div className="item-p">
                    <div className="chart-section">
                        <h3>Tour được yêu thích nhất</h3>
                        {dashboardTours?.mostFavoritedTour?.map((item) => (
                            <p key={item.id}>{item.title}</p>
                        ))}
                    </div>

                    <div className="chart-section" style={{ background: '#FF6600' }}>
                        <h3>Tour được đặt nhiều nhất</h3>
                        {dashboardTours?.mostBookedTour?.map((item) => (
                            <p key={item.id}>{item.title}</p>
                        ))}
                    </div>
                </div>

            </div>
            <div className="order-statistics">
                <h2>Thống kê Đơn hàng</h2>
                <div className="doughnut-container">
                    <div className="chart-section">
                        <h3>Trạng thái Đơn hàng</h3>
                        <Doughnut data={orderStatusData} />
                    </div>
                    <div className="chart-section">
                        <h3>Doanh thu theo phương thức thanh toán</h3>
                        <Doughnut data={paymentMethodRevenueData} />
                    </div>
                </div>
                <div className="line-container">
                    <div className="chart-section">
                        <h3>Doanh thu theo tháng</h3>
                        <Line data={monthlyRevenueData} />
                    </div>

                    <div className="chart-section">
                        <h3>Doanh thu theo tuần</h3>
                        <Line data={weeklyRevenueData} />
                    </div>
                </div>
                <div className="bar-container">
                    <h3>Tỷ lệ hủy đơn hàng</h3>
                    <Bar data={cancellationRateData} />
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
