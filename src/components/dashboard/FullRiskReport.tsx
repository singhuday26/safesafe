import React from 'react';
import { Modal, Button, Table } from 'antd';

const FullRiskReport = ({ visible, onClose, riskData }) => {
  const {
    riskScore,
    riskLevel,
    transactionDetails,
    userInfo,
    geoData,
    historicalPatterns,
  } = riskData;

  const columns = [
    { title: 'Field', dataIndex: 'field', key: 'field' },
    { title: 'Value', dataIndex: 'value', key: 'value' },
  ];

  const dataSource = [
    { key: '1', field: 'Risk Score', value: riskScore },
    { key: '2', field: 'Risk Level', value: riskLevel },
    { key: '3', field: 'Transaction Amount', value: transactionDetails.amount },
    { key: '4', field: 'Transaction Date', value: transactionDetails.date },
    { key: '5', field: 'Transaction Type', value: transactionDetails.type },
    { key: '6', field: 'User Name', value: userInfo.name },
    { key: '7', field: 'User Email', value: userInfo.email },
    { key: '8', field: 'Location', value: geoData.location },
    { key: '9', field: 'IP Address', value: geoData.ip },
    { key: '10', field: 'Historical Anomalies', value: historicalPatterns.anomalies },
  ];

  return (
    <Modal
      title="Full Risk Report"
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
    >
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        showHeader={false}
        bordered
      />
    </Modal>
  );
};

export default FullRiskReport;
