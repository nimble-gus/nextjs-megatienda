
import '../../styles/DashboardHeader.css';

const DashboardHeader = ({ startDate, endDate, onDateChange }) => {
    return (
        <div className="dashboard-header">
            <div className="date-filters">
                <label>Desde:</label>
                <input type="date" value={startDate} onChange={(e) => onDateChange('start', e.target.value)} />
                <label>Hasta:</label>
                <input type="date" value={endDate} onChange={(e) => onDateChange('end', e.target.value)} />
            </div>
        </div>
    );
};

export default DashboardHeader;
