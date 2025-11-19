'use client';

import { useState, useEffect } from 'react';

interface Department {
	_id: string;
	name: string;
	code: string;
	description?: string;
	headId?: {
		_id: string;
		name: string;
		email: string;
	};
	parentDepartment?: string;
	employeeCount: number;
	createdAt: string;
}

interface Division {
	_id: string;
	name: string;
	code: string;
	description?: string;
	managerId?: {
		_id: string;
		name: string;
		email: string;
	};
	departments: string[];
	createdAt: string;
}

interface Hierarchy {
	departments: Department[];
	divisions: Division[];
}

interface DepartmentManagerProps {
	companyId: string;
}

export default function DepartmentManager({ companyId }: DepartmentManagerProps) {
	const [hierarchy, setHierarchy] = useState<Hierarchy>({ departments: [], divisions: [] });
	const [loading, setLoading] = useState(true);
	const [showAddDept, setShowAddDept] = useState(false);
	const [showAddDiv, setShowAddDiv] = useState(false);
	const [editingDept, setEditingDept] = useState<Department | null>(null);

	// Form states
	const [deptForm, setDeptForm] = useState({
		name: '',
		code: '',
		description: '',
		headId: '',
		parentDepartment: '',
	});

	const [divForm, setDivForm] = useState({
		name: '',
		code: '',
		description: '',
		managerId: '',
	});

	useEffect(() => {
		loadHierarchy();
	}, [companyId]);

	const loadHierarchy = async () => {
		try {
			setLoading(true);
			const token = localStorage.getItem('token');
			const response = await fetch(`http://localhost:3000/api/companies/${companyId}/hierarchy`, {
				headers: {
					'Authorization': `Bearer ${token}`,
				},
			});

			if (!response.ok) throw new Error('Failed to fetch hierarchy');

			const data = await response.json();
			setHierarchy(data);
		} catch (error) {
			console.error('Error loading hierarchy:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleAddDepartment = async () => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch(`http://localhost:3000/api/companies/${companyId}/departments`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(deptForm),
			});

			if (!response.ok) throw new Error('Failed to add department');

			setDeptForm({ name: '', code: '', description: '', headId: '', parentDepartment: '' });
			setShowAddDept(false);
			loadHierarchy();
		} catch (error) {
			console.error('Error adding department:', error);
			alert('Failed to add department. Please check if the code is unique.');
		}
	};

	const handleUpdateDepartment = async () => {
		if (!editingDept) return;

		try {
			const token = localStorage.getItem('token');
			const response = await fetch(
				`http://localhost:3000/api/companies/${companyId}/departments/${editingDept._id}`,
				{
					method: 'PUT',
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(deptForm),
				}
			);

			if (!response.ok) throw new Error('Failed to update department');

			setEditingDept(null);
			setDeptForm({ name: '', code: '', description: '', headId: '', parentDepartment: '' });
			loadHierarchy();
		} catch (error) {
			console.error('Error updating department:', error);
			alert('Failed to update department');
		}
	};

	const handleDeleteDepartment = async (deptId: string) => {
		if (!confirm('Are you sure you want to delete this department?')) return;

		try {
			const token = localStorage.getItem('token');
			const response = await fetch(
				`http://localhost:3000/api/companies/${companyId}/departments/${deptId}`,
				{
					method: 'DELETE',
					headers: {
						'Authorization': `Bearer ${token}`,
					},
				}
			);

			if (!response.ok) throw new Error('Failed to delete department');

			loadHierarchy();
		} catch (error) {
			console.error('Error deleting department:', error);
			alert('Failed to delete department');
		}
	};

	const handleAddDivision = async () => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch(`http://localhost:3000/api/companies/${companyId}/divisions`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(divForm),
			});

			if (!response.ok) throw new Error('Failed to add division');

			setDivForm({ name: '', code: '', description: '', managerId: '' });
			setShowAddDiv(false);
			loadHierarchy();
		} catch (error) {
			console.error('Error adding division:', error);
			alert('Failed to add division. Please check if the code is unique.');
		}
	};

	const startEditDepartment = (dept: Department) => {
		setEditingDept(dept);
		setDeptForm({
			name: dept.name,
			code: dept.code,
			description: dept.description || '',
			headId: dept.headId?._id || '',
			parentDepartment: dept.parentDepartment || '',
		});
		setShowAddDept(true);
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center p-12">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
						Departments & Divisions
					</h2>
					<p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
						Manage your company's organizational structure
					</p>
				</div>
				<div className="flex gap-2">
					<button
						onClick={() => {
							setShowAddDiv(true);
							setDivForm({ name: '', code: '', description: '', managerId: '' });
						}}
						className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
					>
						+ Add Division
					</button>
					<button
						onClick={() => {
							setShowAddDept(true);
							setEditingDept(null);
							setDeptForm({ name: '', code: '', description: '', headId: '', parentDepartment: '' });
						}}
						className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						+ Add Department
					</button>
				</div>
			</div>

			{/* Summary Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
					<p className="text-sm text-neutral-600 dark:text-neutral-400">Total Divisions</p>
					<p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">
						{hierarchy.divisions.length}
					</p>
				</div>
				<div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
					<p className="text-sm text-neutral-600 dark:text-neutral-400">Total Departments</p>
					<p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
						{hierarchy.departments.length}
					</p>
				</div>
				<div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
					<p className="text-sm text-neutral-600 dark:text-neutral-400">Total Employees</p>
					<p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
						{hierarchy.departments.reduce((sum, dept) => sum + dept.employeeCount, 0)}
					</p>
				</div>
			</div>

			{/* Divisions Section */}
			<div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
				<h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
					Divisions
				</h3>
				{hierarchy.divisions.length === 0 ? (
					<p className="text-neutral-600 dark:text-neutral-400 text-center py-8">
						No divisions yet. Create your first division to get started.
					</p>
				) : (
					<div className="space-y-3">
						{hierarchy.divisions.map((division) => (
							<div
								key={division._id}
								className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
							>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-center gap-2">
											<h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
												{division.name}
											</h4>
											<span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded">
												{division.code}
											</span>
										</div>
										{division.description && (
											<p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
												{division.description}
											</p>
										)}
										{division.managerId && (
											<p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
												<span className="font-medium">Manager:</span> {division.managerId.name}
											</p>
										)}
										<p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
											<span className="font-medium">Departments:</span> {division.departments.length}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Departments Section */}
			<div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
				<h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
					Departments
				</h3>
				{hierarchy.departments.length === 0 ? (
					<p className="text-neutral-600 dark:text-neutral-400 text-center py-8">
						No departments yet. Create your first department to get started.
					</p>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{hierarchy.departments.map((department) => (
							<div
								key={department._id}
								className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
							>
								<div className="flex items-start justify-between mb-2">
									<div className="flex-1">
										<div className="flex items-center gap-2">
											<h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
												{department.name}
											</h4>
											<span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
												{department.code}
											</span>
										</div>
										{department.description && (
											<p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
												{department.description}
											</p>
										)}
									</div>
								</div>
								<div className="space-y-1 text-sm">
									{department.headId && (
										<p className="text-neutral-600 dark:text-neutral-400">
											<span className="font-medium">Head:</span> {department.headId.name}
										</p>
									)}
									<p className="text-neutral-600 dark:text-neutral-400">
										<span className="font-medium">Employees:</span> {department.employeeCount}
									</p>
									<p className="text-neutral-600 dark:text-neutral-400">
										<span className="font-medium">Created:</span>{' '}
										{new Date(department.createdAt).toLocaleDateString()}
									</p>
								</div>
								<div className="flex gap-2 mt-3">
									<button
										onClick={() => startEditDepartment(department)}
										className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
									>
										Edit
									</button>
									<button
										onClick={() => handleDeleteDepartment(department._id)}
										className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
									>
										Delete
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Add/Edit Department Modal */}
			{showAddDept && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white dark:bg-neutral-800 rounded-xl max-w-md w-full p-6">
						<h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
							{editingDept ? 'Edit Department' : 'Add New Department'}
						</h3>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
									Name *
								</label>
								<input
									type="text"
									value={deptForm.name}
									onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
									className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100"
									placeholder="Engineering"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
									Code *
								</label>
								<input
									type="text"
									value={deptForm.code}
									onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
									className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100"
									placeholder="ENG"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
									Description
								</label>
								<textarea
									value={deptForm.description}
									onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
									className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100"
									rows={3}
									placeholder="Department description..."
								/>
							</div>
							<div className="flex gap-2 justify-end">
								<button
									onClick={() => {
										setShowAddDept(false);
										setEditingDept(null);
										setDeptForm({ name: '', code: '', description: '', headId: '', parentDepartment: '' });
									}}
									className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
								>
									Cancel
								</button>
								<button
									onClick={editingDept ? handleUpdateDepartment : handleAddDepartment}
									disabled={!deptForm.name || !deptForm.code}
									className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
								>
									{editingDept ? 'Update' : 'Add'} Department
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Add Division Modal */}
			{showAddDiv && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white dark:bg-neutral-800 rounded-xl max-w-md w-full p-6">
						<h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
							Add New Division
						</h3>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
									Name *
								</label>
								<input
									type="text"
									value={divForm.name}
									onChange={(e) => setDivForm({ ...divForm, name: e.target.value })}
									className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100"
									placeholder="Technology Division"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
									Code *
								</label>
								<input
									type="text"
									value={divForm.code}
									onChange={(e) => setDivForm({ ...divForm, code: e.target.value })}
									className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100"
									placeholder="TECH"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
									Description
								</label>
								<textarea
									value={divForm.description}
									onChange={(e) => setDivForm({ ...divForm, description: e.target.value })}
									className="w-full px-3 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100"
									rows={3}
									placeholder="Division description..."
								/>
							</div>
							<div className="flex gap-2 justify-end">
								<button
									onClick={() => {
										setShowAddDiv(false);
										setDivForm({ name: '', code: '', description: '', managerId: '' });
									}}
									className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
								>
									Cancel
								</button>
								<button
									onClick={handleAddDivision}
									disabled={!divForm.name || !divForm.code}
									className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
								>
									Add Division
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
