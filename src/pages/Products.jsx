import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Save, Loader2, AlertCircle, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ProductsPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [makes, setMakes] = useState([]);
    const [models, setModels] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [brandFilter, setBrandFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '', slug: '', sku: '', description: '', price: '', stock: '',
        category: '', brand: '', is_active: true, warranty: '',
        make: '', model: '', state: '', city: '',
        exchange_available: false, exchange_discount: 0
    });
    // Separate state for images and specifications
    const [imageFiles, setImageFiles] = useState([]); // array of File objects
    const [specRows, setSpecRows] = useState([{ key: '', value: '' }]);
    const [primaryImageIndex, setPrimaryImageIndex] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [buyingProduct, setBuyingProduct] = useState(null);

    // Combo State
    const [combos, setCombos] = useState([]);
    const [isComboModalOpen, setIsComboModalOpen] = useState(false);
    const [comboFormData, setComboFormData] = useState({
        name: '', price: '', inverter: '', battery: '', is_active: true
    });
    const [comboImageFile, setComboImageFile] = useState(null);
    const [comboSubmitting, setComboSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('products'); // 'products' or 'combos'

    const slugify = (text) => {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
    };

    const handleItemNameChange = (val) => {
        setFormData({
            ...formData,
            name: val,
            slug: slugify(val)
        });
    };

    const fetchData = async (search = '', cat = '', brand = '', status = 'all') => {
        try {
            setLoading(true);
            setError(null);
            
            let query = `products/?search=${search}`;
            if (cat) query += `&category=${cat}`;
            if (brand) query += `&brand=${brand}`;
            if (status !== 'all') query += `&is_active=${status === 'active'}`;

            const [prodRes, catRes, brandRes, comboRes, makeRes, stateRes] = await Promise.all([
                api.get(query),
                api.get('products/categories/'),
                api.get('products/brands/'),
                api.get('products/combos/'),
                api.get('products/makes/'),
                api.get('locations/states/')
            ]);
            
            // Handle DRF Pagination (results) or simple list
            const productsData = prodRes.data.results || prodRes.data;
            if (!Array.isArray(productsData)) {
                console.error('API Error: Product data is not an array', prodRes.data);
                throw new Error('Invalid data format received from server');
            }
            
            setProducts(productsData);
            setCombos(comboRes.data.results || comboRes.data || []);
            setCategories(Array.isArray(catRes.data.results) ? catRes.data.results : (Array.isArray(catRes.data) ? catRes.data : []));
            setBrands(Array.isArray(brandRes.data.results) ? brandRes.data.results : (Array.isArray(brandRes.data) ? brandRes.data : []));
            setMakes(Array.isArray(makeRes.data.results) ? makeRes.data.results : (Array.isArray(makeRes.data) ? makeRes.data : []));
            setStates(Array.isArray(stateRes.data.results) ? stateRes.data.results : (Array.isArray(stateRes.data) ? stateRes.data : []));
            console.log('Inventory loaded successfully:', { count: productsData.length, comboCount: (comboRes.data.results || comboRes.data || []).length });
        } catch (err) {
            console.error('Products Fetch Error:', {
                status: err.response?.status,
                data: err.response?.data,
                message: err.message
            });
            setError('Failed to load inventory data. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchData(searchTerm, categoryFilter, brandFilter, statusFilter);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, categoryFilter, brandFilter, statusFilter]);

    // Fetch models when make changes
    useEffect(() => {
        const fetchModels = async () => {
            if (formData.make) {
                try {
                    const res = await api.get(`products/models/?make_id=${formData.make}`);
                    setModels(Array.isArray(res.data.results) ? res.data.results : (Array.isArray(res.data) ? res.data : []));
                } catch (err) {
                    console.error('Error fetching models:', err);
                }
            } else {
                setModels([]);
            }
        };
        fetchModels();
    }, [formData.make]);

    // Fetch cities when state changes
    useEffect(() => {
        const fetchCities = async () => {
            if (formData.state) {
                try {
                    const res = await api.get(`locations/cities/?state_id=${formData.state}`);
                    setCities(Array.isArray(res.data.results) ? res.data.results : (Array.isArray(res.data) ? res.data : []));
                } catch (err) {
                    console.error('Error fetching cities:', err);
                }
            } else {
                setCities([]);
            }
        };
        fetchCities();
    }, [formData.state]);

    const handleBuy = async (productId) => {
        setBuyingProduct(productId);
        try {
            await api.post('orders/', {
                product: productId,
                quantity: 1
            });
            alert('Order created successfully!');
            fetchData(); // Refresh product list to reflect any stock changes or just state updates
        } catch (err) {
            console.error('Order Error:', err);
            const errorMessage = err.response?.data?.error || 'Failed to create order. Please try again.';
            alert(errorMessage);
        } finally {
            setBuyingProduct(null);
        }
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                slug: product.slug,
                sku: product.sku,
                description: product.description,
                price: product.price,
                stock: product.stock,
                category: product.category,
                brand: product.brand,
                is_active: product.is_active,
                warranty: product.warranty || '',
                make: product.make || '',
                model: product.model || '',
                state: product.state || '',
                city: product.city || '',
                exchange_available: product.exchange_available || false,
                exchange_discount: product.exchange_discount || 0,
                images: product.images ? product.images.map(img => ({ url: img.image })) : []
            });
            // Reset image/spec state for editing
            setImageFiles([]);
            const existingSpecs = product.specifications && product.specifications.length > 0 
                ? product.specifications.map(s => ({ key: s.key, value: s.value })) 
                : [{ key: '', value: '' }];
            setSpecRows(existingSpecs);
            setPrimaryImageIndex(product.images ? product.images.findIndex(img => img.is_primary) : null);
        } else {
            setEditingProduct(null);
            setFormData({
                name: '', slug: '', sku: '', description: '', price: '', stock: '',
                category: '', brand: '', is_active: true, warranty: '',
                make: '', model: '', state: '', city: '',
                exchange_available: false, exchange_discount: 0
            });
            setImageFiles([]);
            setSpecRows([{ key: '', value: '' }]);
            setPrimaryImageIndex(null);
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Step 1: Create product (without images/specs)
            // The backend ProductViewSet explicitly defines parser_classes = [MultiPartParser, FormParser],
            // so sending application/json will trigger a 415 error. We MUST use FormData or URLSearchParams.
            const productFd = new FormData();
            productFd.append('name', formData.name);
            productFd.append('slug', formData.slug);
            productFd.append('sku', formData.sku);
            productFd.append('description', formData.description);
            productFd.append('price', formData.price);
            productFd.append('stock', formData.stock);
            productFd.append('is_active', formData.is_active);
            if (formData.warranty) productFd.append('warranty', formData.warranty);
            if (formData.category) productFd.append('category', formData.category);
            if (formData.brand) productFd.append('brand', formData.brand);
            if (formData.make) productFd.append('make', formData.make);
            if (formData.model) productFd.append('model', formData.model);
            if (formData.state) productFd.append('state', formData.state);
            if (formData.city) productFd.append('city', formData.city);
            productFd.append('exchange_available', formData.exchange_available);
            productFd.append('exchange_discount', formData.exchange_discount);

            console.log('--- STEP 1: CREATE PRODUCT ---');
            console.log('Product Request sent as Form Data due to backend parser constraints.');

            let productResponse;
            if (editingProduct) {
                productResponse = await api.put(`products/${editingProduct.id}/`, productFd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                productResponse = await api.post('products/', productFd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            const productId = editingProduct ? editingProduct.id : productResponse.data.id;
            console.log('Product created/updated successfully with ID:', productId);

            // Step 2: Upload images (if any)
            if (imageFiles.length > 0) {
                console.log('--- STEP 2: UPLOAD IMAGES ---');
                for (let i = 0; i < imageFiles.length; i++) {
                    const fd = new FormData();
                    fd.append('product', productId);
                    fd.append('image', imageFiles[i]);
                    fd.append('is_primary', i === primaryImageIndex);

                    console.log(`Image ${i + 1} API URL: products/product-images/`);
                    console.log(`Image ${i + 1} File name:`, imageFiles[i].name);
                    console.log(`Image ${i + 1} Form Data fields: { product: ${productId}, is_primary: ${i === primaryImageIndex} }`);
                    console.log(`Image ${i + 1} Headers: Content-Type: multipart/form-data (Auto-set by Axios)`);

                    await api.post('products/product-images/', fd, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                }
                console.log('Images uploaded successfully.');
            }

            // Step 3: Add specifications (if any)
            const specsToSend = specRows.filter(r => r.key && r.value);
            if (specsToSend.length > 0) {
                console.log('--- STEP 3: ADD SPECIFICATIONS ---');
                for (const spec of specsToSend) {
                    const specPayload = {
                        product: productId,
                        key: spec.key,
                        value: spec.value
                    };
                    console.log('Specification API URL: products/product-specifications/');
                    console.log('Specification Request Payload:', specPayload);

                    await api.post('products/product-specifications/', specPayload);
                }
                console.log('Specifications added successfully.');
            }

            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            console.error('---  SUBMIT ERROR DEBUG ---');
            console.error('Full Error Response Object:', err);
            if (err.response) {
                console.error('Error Status:', err.response.status);
                console.error('Error Data:', err.response.data);
                console.error('Error Headers:', err.response.headers);
            }
            alert('Operation failed. Please check the Developer Console for detailed API errors.');
        } finally {
            setSubmitting(false);
        }
    };


    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`products/${id}/`);
                fetchData();
            } catch (err) {
                alert('Delete failed.');
            }
        }
    };

    const handleComboSubmit = async (e) => {
        e.preventDefault();
        setComboSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('name', comboFormData.name);
            fd.append('price', comboFormData.price);
            fd.append('inverter', comboFormData.inverter);
            fd.append('battery', comboFormData.battery);
            fd.append('is_active', comboFormData.is_active);
            if (comboImageFile) {
                fd.append('image', comboImageFile);
            }

            await api.post('products/combos/', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setIsComboModalOpen(false);
            setComboFormData({ name: '', price: '', inverter: '', battery: '', is_active: true });
            setComboImageFile(null);
            fetchData();
            alert('Combo created successfully!');
        } catch (err) {
            console.error('Combo Create Error:', err.response?.data);
            const errorMsg = err.response?.data?.non_field_errors?.[0] || 'Failed to create combo. Check if Inverter and Battery are different.';
            alert(errorMsg);
        } finally {
            setComboSubmitting(false);
        }
    };

    const handleDeleteCombo = async (id) => {
        if (window.confirm('Are you sure you want to delete this combo?')) {
            try {
                await api.delete(`products/combos/${id}/`);
                fetchData();
            } catch (err) {
                alert('Delete failed.');
            }
        }
    };

    // HANDLE IMAGE UPLOAD
const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    setImageFiles(files);

    const previews = files.map(file => ({
        url: URL.createObjectURL(file)
    }));

    setFormData(prev => ({
        ...prev,
        images: previews
    }));

    if (files.length > 0) {
        setPrimaryImageIndex(0);
    }
};

   //  SPEC HANDLERS
const addSpec = () => {
    setSpecRows([...specRows, { key: '', value: '' }]);
};

const removeSpec = (index) => {
    const updated = [...specRows];
    updated.splice(index, 1);
    setSpecRows(updated);
};

const updateSpec = (index, field, value) => {
    const updated = [...specRows];
    updated[index][field] = value;
    setSpecRows(updated);
};

    const getCategoryName = (id) => {
        if (!id) return 'Uncategorized';
        const cat = categories.find(c => c.id === parseInt(id));
        return cat ? cat.name : 'Uncategorized';
    };

    const getBrandName = (id) => {
        if (!id) return 'Generic';
        const brand = brands.find(b => b.id === parseInt(id));
        return brand ? brand.name : 'Generic';
    };

    const filteredProducts = products; // Backend already filters now

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-main)' }}>Product Inventory</h1>
                    <p style={{ color: 'var(--text-dim)', fontWeight: 500 }}>Manage catalog, pricing, and stock levels.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {user?.role === 'ADMIN' && (
                        <>
                            <button onClick={() => navigate('/categories')} className="glass action-btn" style={{ padding: '0.6rem 1rem', borderRadius: '10px', color: 'var(--text-main)', border: '1px solid #ced4da', background: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Manage Categories</button>
                            <button onClick={() => navigate('/brands')} className="glass action-btn" style={{ padding: '0.6rem 1rem', borderRadius: '10px', color: 'var(--text-main)', border: '1px solid #ced4da', background: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Manage Brands</button>
                            <button onClick={() => navigate('/vehicles')} className="glass action-btn" style={{ padding: '0.6rem 1rem', borderRadius: '10px', color: 'var(--text-main)', border: '1px solid #ced4da', background: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Manage Vehicles</button>
                            <button onClick={() => navigate('/locations')} className="glass action-btn" style={{ padding: '0.6rem 1rem', borderRadius: '10px', color: 'var(--text-main)', border: '1px solid #ced4da', background: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Manage Locations</button>
                            <button 
                                onClick={() => setIsComboModalOpen(true)}
                                className="glass action-btn" 
                                style={{ padding: '0.6rem 1rem', borderRadius: '10px', color: 'white', border: 'none', background: 'var(--grad-blue, #3b82f6)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                            >
                                <Plus size={16} style={{ marginRight: '4px' }} /> Create Combo
                            </button>
                            <button 
                                onClick={() => handleOpenModal()}
                                className="glass" 
                                style={{ 
                                    padding: '0.75rem 1.5rem', 
                                    borderRadius: '12px', 
                                    background: 'var(--grad-purple)', 
                                    border: 'none', 
                                    color: 'white', 
                                    fontWeight: 600, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px', 
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 15px rgba(218, 140, 255, 0.3)'
                                }}>
                                <Plus size={18} /> Add Product
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Tab Switcher */}
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                <button 
                    onClick={() => setActiveTab('products')}
                    style={{ 
                        padding: '0.5rem 1rem', 
                        background: 'none', 
                        border: 'none', 
                        borderBottom: activeTab === 'products' ? '3px solid var(--red-main)' : '3px solid transparent',
                        color: activeTab === 'products' ? 'var(--red-main)' : 'var(--text-dim)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}
                >
                    Standard Products
                </button>
                <button 
                    onClick={() => setActiveTab('combos')}
                    style={{ 
                        padding: '0.5rem 1rem', 
                        background: 'none', 
                        border: 'none', 
                        borderBottom: activeTab === 'combos' ? '3px solid var(--red-main)' : '3px solid transparent',
                        color: activeTab === 'combos' ? 'var(--red-main)' : 'var(--text-dim)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}
                >
                    Combo Packs ({combos.length})
                </button>
            </div>

            {/* Toolbar & Filters */}
            <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px', marginBottom: '1.5rem', background: '#f1f5f9', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#ffffff', padding: '10px 15px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <Search size={18} color="var(--text-main)" />
                    <input 
                        type="text" 
                        placeholder="Search by name or SKU..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '0.95rem', fontWeight: 500 }} 
                    />
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    <select 
                        value={categoryFilter} 
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#ffffff', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.85rem', outline: 'none', minWidth: '150px' }}
                    >
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>

                    <select 
                        value={brandFilter} 
                        onChange={(e) => setBrandFilter(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#ffffff', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.85rem', outline: 'none', minWidth: '150px' }}
                    >
                        <option value="">All Brands</option>
                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>

                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#ffffff', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.85rem', outline: 'none', minWidth: '120px' }}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    {(searchTerm || categoryFilter || brandFilter || statusFilter !== 'all') && (
                        <button 
                            onClick={() => { setSearchTerm(''); setCategoryFilter(''); setBrandFilter(''); setStatusFilter('all'); }}
                            style={{ padding: '8px 12px', background: 'none', border: 'none', color: '#ef4444', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Product Table */}
            {activeTab === 'products' ? (
                <div className="glass" style={{ borderRadius: '12px', overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: '#f8fafc', borderBottom: '2px solid var(--glass-border)' }}>
                                <tr>
                                    <th style={{ padding: '1.25rem' }}>Product</th>
                                    <th style={{ padding: '1.25rem' }}>SKU</th>
                                    <th style={{ padding: '1.25rem' }}>Category</th>
                                    <th style={{ padding: '1.25rem' }}>Price</th>
                                    <th style={{ padding: '1.25rem' }}>Stock</th>
                                    <th style={{ padding: '1.25rem' }}>Status</th>
                                    <th style={{ padding: '1.25rem', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" style={{ padding: '4rem', textAlign: 'center' }}>
                                            <Loader2 className="animate-spin" size={32} color="var(--primary-glow)" />
                                        </td>
                                    </tr>
                                ) : filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                                            {searchTerm ? 'No products found matching your search.' : 'No products available in inventory.'}
                                        </td>
                                    </tr>
                                ) : filteredProducts.map((p) => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid var(--glass-border)' }} className="table-row">
                                        <td style={{ padding: '1.25rem' }}>
                                            <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{p.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>{getBrandName(p.brand)}</div>
                                        </td>
                                        <td style={{ padding: '1.25rem', color: 'var(--text-dim)', fontSize: '0.875rem' }}>{p.sku}</td>
                                        <td style={{ padding: '1.25rem' }}>
                                            <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' }}>
                                                {getCategoryName(p.category)}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.25rem', fontWeight: 800, color: 'var(--red-main)', fontSize: '1rem' }}>₹{p.price}</td>
                                        <td style={{ padding: '1.25rem' }}>
                                            <div style={{ color: p.stock < 10 ? '#ef4444' : 'var(--text-main, #1f2937)', fontWeight: 500 }}>{p.stock} units</div>
                                        </td>
                                        <td style={{ padding: '1.25rem' }}>
                                            <div style={{ 
                                                padding: '4px 12px', 
                                                borderRadius: '20px', 
                                                fontSize: '0.7rem', 
                                                background: p.is_active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                color: p.is_active ? '#22c55e' : '#ef4444',
                                                display: 'inline-block'
                                            }}>
                                                {p.is_active ? 'Active' : 'Hidden'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                {user?.role === 'CUSTOMER' && (
                                                    <button 
                                                        onClick={() => handleBuy(p.id)} 
                                                        disabled={buyingProduct === p.id}
                                                        className="action-btn buy" 
                                                        style={{ 
                                                            padding: '6px 12px', 
                                                            borderRadius: '8px', 
                                                            border: 'none', 
                                                            cursor: buyingProduct === p.id ? 'not-allowed' : 'pointer', 
                                                            background: 'var(--grad-purple)',
                                                            color: 'white',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            fontWeight: 600,
                                                            fontSize: '0.85rem'
                                                        }}
                                                    >
                                                        {buyingProduct === p.id ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={16} />} 
                                                        {buyingProduct === p.id ? 'Wait...' : 'Buy'}
                                                    </button>
                                                )}
                                                {(user?.role === 'ADMIN' || user?.role === 'SELLER') && (
                                                    <>
                                                        <button onClick={() => handleOpenModal(p)} className="action-btn" style={{ padding: '6px', borderRadius: '8px', border: '1px solid var(--glass-border, #e5e7eb)', cursor: 'pointer', background: 'transparent', color: 'var(--text-main, #3b82f6)' }}>
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button onClick={() => handleDelete(p.id)} className="action-btn delete" style={{ padding: '6px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', background: 'transparent', color: '#ef4444' }}>
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* Combo Table */
                <div className="glass" style={{ borderRadius: '12px', overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: '#f8fafc', borderBottom: '2px solid var(--glass-border)' }}>
                                <tr>
                                    <th style={{ padding: '1.25rem' }}>Combo Name</th>
                                    <th style={{ padding: '1.25rem' }}>Components</th>
                                    <th style={{ padding: '1.25rem' }}>Price</th>
                                    <th style={{ padding: '1.25rem' }}>Status</th>
                                    <th style={{ padding: '1.25rem', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {combos.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                                            No combo packs available.
                                        </td>
                                    </tr>
                                ) : combos.map((c) => (
                                    <tr key={c.id} style={{ borderBottom: '1px solid var(--glass-border)' }} className="table-row">
                                        <td style={{ padding: '1.25rem' }}>
                                            <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{c.name}</div>
                                            {c.image && <img src={c.image} alt={c.name} style={{ width: '40px', height: '40px', borderRadius: '4px', marginTop: '4px' }} />}
                                        </td>
                                        <td style={{ padding: '1.25rem' }}>
                                            <div style={{ fontSize: '0.85rem' }}>
                                                <strong>Inverter:</strong> {c.inverter_name}<br/>
                                                <strong>Battery:</strong> {c.battery_name}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem', fontWeight: 800, color: 'var(--red-main)', fontSize: '1.1rem' }}>₹{c.price}</td>
                                        <td style={{ padding: '1.25rem' }}>
                                            <div style={{ 
                                                padding: '4px 12px', 
                                                borderRadius: '20px', 
                                                fontSize: '0.7rem', 
                                                background: c.is_active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                color: c.is_active ? '#22c55e' : '#ef4444',
                                                display: 'inline-block'
                                            }}>
                                                {c.is_active ? 'Active' : 'Inactive'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                                            {user?.role === 'ADMIN' && (
                                                <button onClick={() => handleDeleteCombo(c.id)} className="action-btn delete" style={{ padding: '6px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', background: 'transparent', color: '#ef4444' }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal for Add/Edit */}
            {isModalOpen && (
                <div className="modal-overlay" style={{ 
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' 
                }}>
                    <form onSubmit={handleSubmit} className="glass" style={{ 
                        width: '100%', maxWidth: '700px', display: 'flex', flexDirection: 'column',
                        borderRadius: '24px', maxHeight: '90vh', overflow: 'hidden', position: 'relative' 
                    }}>
                        {/* Modal Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '2px solid var(--glass-border)', background: '#f8fafc' }}>
                            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#000' }}>{editingProduct ? 'Update Product Details' : 'Register New Product'}</h2>
                            <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body - Scrollable */}
                        <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                                {/* Basic fields */}
                                <div className="input-group">
                                    <label>Product Name</label>
                                    <input required value={formData.name} onChange={e => handleItemNameChange(e.target.value)} />
                                </div>
                                <div className="input-group">
                                    <label>Slug (URL key)</label>
                                    <input required value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} />
                                </div>
                                <div className="input-group">
                                    <label>SKU</label>
                                    <input required value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} />
                                </div>
                                <div className="input-group">
                                    <label>Price (₹)</label>
                                    <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                                </div>
                                <div className="input-group">
                                    <label>Stock</label>
                                    <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                                </div>
                                <div className="input-group">
                                    <label>Warranty</label>
                                    <input value={formData.warranty} onChange={e => setFormData({...formData, warranty: e.target.value})} placeholder="e.g. 1 Year, 6 Months" />
                                </div>
                                <div className="input-group">
                                    <label>Category</label>
                                    <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Brand</label>
                                    <select required value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})}>
                                        <option value="">Select Brand</option>
                                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Vehicle Make</label>
                                    <select value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})}>
                                        <option value="">Select Make</option>
                                        {makes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Vehicle Model</label>
                                    <select value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})}>
                                        <option value="">Select Model</option>
                                        {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>State</label>
                                    <select value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})}>
                                        <option value="">Select State</option>
                                        {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>City</label>
                                    <select value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}>
                                        <option value="">Select City</option>
                                        {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '25px' }}>
                                    <input 
                                        type="checkbox" 
                                        id="exchange_available" 
                                        checked={formData.exchange_available} 
                                        onChange={e => setFormData({...formData, exchange_available: e.target.checked})} 
                                    />
                                    <label htmlFor="exchange_available" style={{ margin: 0 }}>Exchange Available</label>
                                </div>
                                {formData.exchange_available && (
                                    <div className="input-group">
                                        <label>Exchange Discount (₹)</label>
                                        <input 
                                            type="number" 
                                            value={formData.exchange_discount} 
                                            onChange={e => setFormData({...formData, exchange_discount: e.target.value})} 
                                            placeholder="Discount amount for old battery"
                                        />
                                    </div>
                                )}
                                <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '25px' }}>
                                    <input 
                                        type="checkbox" 
                                        id="is_active" 
                                        checked={formData.is_active} 
                                        onChange={e => setFormData({...formData, is_active: e.target.checked})} 
                                    />
                                    <label htmlFor="is_active" style={{ margin: 0 }}>Product Active/Visible</label>
                                </div>
                                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                    <label>Description</label>
                                    <textarea rows="3" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                                </div>
                                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                    <label>Images</label>
                                    <input type="file" multiple onChange={handleImageUpload} />
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                                        {formData.images?.map((img, idx) => (
                                            <div key={idx} style={{ position: 'relative' }}>
                                                <img 
                                                    src={img.url} 
                                                    alt="preview" 
                                                    style={{ 
                                                        width: '80px', 
                                                        height: '80px', 
                                                        objectFit: 'cover', 
                                                        borderRadius: '8px', 
                                                        border: idx === primaryImageIndex ? '2px solid var(--red-main)' : 'none' 
                                                    }} 
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={() => setPrimaryImageIndex(idx)} 
                                                    style={{ 
                                                        position: 'absolute', 
                                                        bottom: 0, left: 0, right: 0, 
                                                        fontSize: '0.6rem', 
                                                        background: idx === primaryImageIndex ? 'var(--red-main)' : 'rgba(0,0,0,0.5)', 
                                                        color: 'white', 
                                                        border: 'none', 
                                                        cursor: 'pointer',
                                                        padding: '2px 0'
                                                    }}>
                                                    {idx === primaryImageIndex ? 'Primary' : 'Set Primary'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <label style={{ margin: 0 }}>Specifications</label>
                                        <button type="button" onClick={addSpec} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--red-main)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Add Row</button>
                                    </div>
                                    {specRows.map((spec, idx) => (
                                        <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                                            <input 
                                                placeholder="Key (e.g. Dimensions)" 
                                                value={spec.key} 
                                                onChange={e => updateSpec(idx, 'key', e.target.value)} 
                                                style={{ flex: 1 }} 
                                            />
                                            <input 
                                                placeholder="Value (e.g. 10x20x30 cm)" 
                                                value={spec.value} 
                                                onChange={e => updateSpec(idx, 'value', e.target.value)} 
                                                style={{ flex: 2 }} 
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => removeSpec(idx)} 
                                                style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer - Fixed */}
                        <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '1rem', justifyContent: 'flex-end', background: '#fff' }}>
                            <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: 'transparent', border: '1px solid #ced4da', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                            <button type="submit" style={{ 
                                padding: '0.75rem 2rem', borderRadius: '12px', background: 'var(--red-main)', border: 'none', color: 'white', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                                boxShadow: '0 4px 15px rgba(211, 47, 47, 0.3)'
                            }}>
                                <Save size={18} /> {editingProduct ? 'Update Changes' : 'Create Product'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
            {/* Combo Modal */}
            {isComboModalOpen && (
                <div className="modal-overlay" style={{ 
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' 
                }}>
                    <form onSubmit={handleComboSubmit} className="glass" style={{ 
                        width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column',
                        borderRadius: '24px', maxHeight: '90vh', overflow: 'hidden', position: 'relative' 
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '2px solid var(--glass-border)', background: '#f8fafc' }}>
                            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#000' }}>Create Combo Pack</h2>
                            <button type="button" onClick={() => setIsComboModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div className="input-group">
                                    <label>Combo Name</label>
                                    <input required value={comboFormData.name} onChange={e => setComboFormData({...comboFormData, name: e.target.value})} placeholder="e.g. Inverter + 150Ah Battery" />
                                </div>
                                <div className="input-group">
                                    <label>Combo Price (₹)</label>
                                    <input required type="number" step="0.01" value={comboFormData.price} onChange={e => setComboFormData({...comboFormData, price: e.target.value})} />
                                </div>
                                <div className="input-group">
                                    <label>Select Inverter</label>
                                    <select required value={comboFormData.inverter} onChange={e => setComboFormData({...comboFormData, inverter: e.target.value})}>
                                        <option value="">Select a Product</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>)}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Select Battery</label>
                                    <select required value={comboFormData.battery} onChange={e => setComboFormData({...comboFormData, battery: e.target.value})}>
                                        <option value="">Select a Product</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>)}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Combo Image</label>
                                    <input type="file" onChange={e => setComboImageFile(e.target.files[0])} />
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '1rem', justifyContent: 'flex-end', background: '#fff' }}>
                            <button type="button" onClick={() => setIsComboModalOpen(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: 'transparent', border: '1px solid #ced4da', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                            <button type="submit" disabled={comboSubmitting} style={{ 
                                padding: '0.75rem 2rem', borderRadius: '12px', background: 'var(--grad-blue, #3b82f6)', border: 'none', color: 'white', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                            }}>
                                {comboSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Create Combo
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <style>
                {`
                    .input-group { display: flex; flex-direction: column; gap: 8px; }
                    .input-group label { font-size: 0.8rem; color: var(--text-dim); font-weight: 500; }
                    .input-group input:focus, .input-group select:focus, .input-group textarea:focus { border-color: var(--red-main); }
                    .input-group input, .input-group select, .input-group textarea {
                        padding: 12px;
                        background: #fff;
                        border: 1px solid #ced4da;
                        border-radius: 12px;
                        color: var(--text-main);
                        outline: none;
                        transition: border-color 0.2s;
                    }
                    .input-group input:focus { border-color: var(--purple-main); }
                    .table-row:hover { background: rgba(0,0,0,0.02); }
                    .action-btn:hover { background: rgba(0,0,0,0.05) !important; scale: 1.05; }
                    .action-btn.delete:hover { background: rgba(239, 68, 68, 0.1) !important; }
                `}
            </style>
        </div>
    );
};

export default ProductsPage;
