import React from 'react';

// Danh sách loại công việc (dữ liệu cứng)
const jobTypes = [
  { id: 5, name: '出張', },
  { id: 6, name: '顧客訪問', },
  { id: 7, name: '在宅勤務／リモートワーク', },
  { id: 8, name: '有給休暇', }
];

const JobTypeManagement = () => {
    return (
      <div>
        <h1>Quản lý loại công việc</h1>
        <ul>
          {jobTypes.map(job => (
            <li key={job.id}>
              {job.name}
            </li>
          ))}
        </ul>
      </div>
    );
  };

export default JobTypeManagement; 