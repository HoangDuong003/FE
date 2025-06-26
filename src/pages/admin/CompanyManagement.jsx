import React from 'react';

// Dữ liệu công ty (có thể fetch từ API sau này)
const companies = [
  {
    id: 6,
    name: '横浜オフィス',
    address: '横浜市',
    description: '横浜市の本社'
  },
  {
    id: 7,
    name: '宮城行政センター',
    address: '宮城県',
    description: '宮城城行政センター'
  },
  {
    id: 8,
    name: '札幌オフィス',
    address: '札幌市',
    description: '札幌オフィス'
  },
  {
    id: 9,
    name: '東京オフィス',
    address: '東京都',
    description: '東京オフィス'
  }
];

const CompanyManagement = () => {
  return (
    <div>
      <h1>Quản lý công ty</h1>
      <ul>
        {companies.map(company => (
          <li key={company.id}>
            <strong>{company.name}</strong>: {company.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CompanyManagement; 