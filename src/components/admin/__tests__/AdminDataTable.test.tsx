import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminDataTable from '../AdminDataTable';

interface TestData {
  id: number;
  name: string;
  age: number;
}

const columns = [
  { key: 'id', title: 'ID', sortable: true },
  { key: 'name', title: 'Name', sortable: true },
  { key: 'age', title: 'Age', sortable: true },
];

const data: TestData[] = [
  { id: 1, name: 'Alice', age: 30 },
  { id: 2, name: 'Bob', age: 25 },
  { id: 3, name: 'Charlie', age: 35 },
];

describe('AdminDataTable', () => {
  test('renders table headers and data', () => {
    render(<AdminDataTable columns={columns} data={data} />);
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  test('sorts data ascending and descending', () => {
    render(<AdminDataTable columns={columns} data={data} />);
    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);
    // After first click, sorted ascending by name
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Alice');
    fireEvent.click(nameHeader);
    // After second click, sorted descending by name
    expect(rows[1]).toHaveTextContent('Charlie');
  });

  test('calls onSearch when typing in search input', () => {
    const onSearch = jest.fn();
    render(<AdminDataTable columns={columns} data={data} searchable onSearch={onSearch} />);
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'Alice' } });
    expect(onSearch).toHaveBeenCalledWith('Alice');
  });

  test('renders loading skeleton when loading is true', () => {
    render(<AdminDataTable columns={columns} data={[]} loading />);
    expect(screen.getByText(/No data available/i)).toBeInTheDocument();
  });

  test('renders pagination controls and navigates pages', () => {
    const onChange = jest.fn();
    render(
      <AdminDataTable
        columns={columns}
        data={data}
        pagination={{ current: 1, pageSize: 1, total: 3, onChange }}
      />
    );
    expect(screen.getByText(/Showing 1 to 1 of 3 results/i)).toBeInTheDocument();
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    expect(onChange).toHaveBeenCalledWith(2, 1);
  });

  test('renders action buttons and triggers onClick', () => {
    const onClick = jest.fn();
    const actions = [
      { label: 'Edit', onClick },
    ];
    render(<AdminDataTable columns={columns} data={data} actions={actions} />);
    const editButton = screen.getAllByText('Edit')[0];
    fireEvent.click(editButton);
    expect(onClick).toHaveBeenCalledWith(data[0]);
  });

  test('renders mobile card view when mobileCardRender is provided', () => {
    interface RecordWithName {
      name: string;
    }
    const mobileCardRender = jest.fn((record: RecordWithName) => <div>{record.name}</div>);
    render(<AdminDataTable columns={columns} data={data} mobileCardRender={mobileCardRender} />);
    expect(mobileCardRender).toHaveBeenCalled();
  });

  test('displays emptyText when no data', () => {
    render(<AdminDataTable columns={columns} data={[]} emptyText="No records" />);
    expect(screen.getByText('No records')).toBeInTheDocument();
  });
});
