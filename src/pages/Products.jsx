import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Save, Loader2, AlertCircle, ShoppingCart, Box } from 'lucide-react';
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

    const [formData, setFormData] = useState({
        name: '', slug: '', sku: '', description: '', price: '', stock: '',
        category: [], brand: [], is_active: true, warranty: '',
        make: [], model: [], state: [], city: [], pincodes: [],
        exchange_available: false, exchange_discount: 0
    });
    const [availablePincodes, setAvailablePincodes] = useState([]);
    // Separate state for images and specifications
    const [specRows, setSpecRows] = useState([{ key: '', value: '' }]);
    const [primaryImageIndex, setPrimaryImageIndex] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [buyingProduct, setBuyingProduct] = useState(null);
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Combo State
    const [combos, setCombos] = useState([]);
    const [comboFormData, setComboFormData] = useState({
        name: '', slug: '', sku: '', price: '', inverter: '', battery: '',
        is_active: true, warranty: '', make: [], model: [], state: [], city: [], pincodes: [],
        category: [], brand: [], description: '', special_price: '',
        exchange_available: false, exchange_discount: 0
    });
    const [isComboModalOpen, setIsComboModalOpen] = useState(false);
    const [editingCombo, setEditingCombo] = useState(null);
    const [comboImages, setComboImages] = useState([]);
    const [comboSpecRows, setComboSpecRows] = useState([{ key: '', value: '' }]);
    const [comboPrimaryImageIndex, setComboPrimaryImageIndex] = useState(null);
    const [comboSubmitting, setComboSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('products'); // 'products' or 'combos'

    const handleComboImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map(file => ({
            url: URL.createObjectURL(file),
            file: file
        }));
        setComboImages([...comboImages, ...newImages]);
        if (comboPrimaryImageIndex === null && newImages.length > 0) {
            setComboPrimaryImageIndex(comboImages.length);
        }
        e.target.value = null;
    };

    const removeComboImage = (index) => {
        const newImages = [...comboImages];
        URL.revokeObjectURL(newImages[index].url);
        newImages.splice(index, 1);
        setComboImages(newImages);
        if (comboPrimaryImageIndex === index) setComboPrimaryImageIndex(null);
        else if (comboPrimaryImageIndex > index) setComboPrimaryImageIndex(comboPrimaryImageIndex - 1);
    };

    const handleAddComboSpecRow = () => {
        setComboSpecRows([...comboSpecRows, { key: '', value: '' }]);
    };

    const handleComboSpecChange = (index, field, value) => {
        const newRows = [...comboSpecRows];
        newRows[index][field] = value;
        setComboSpecRows(newRows);
    };

    const removeComboSpecRow = (index) => {
        if (comboSpecRows.length > 1) {
            const newRows = [...comboSpecRows];
            newRows.splice(index, 1);
            setComboSpecRows(newRows);
        }
    };

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

    const handleComboNameChange = (val) => {
        setComboFormData({
            ...comboFormData,
            name: val,
            slug: slugify(val)
        });
    };

    const handleRemoveTag = (idToRemove, fieldName, isCombo = false) => {
        const idStr = idToRemove.toString();
        if (isCombo) {
            setComboFormData(prev => ({
                ...prev,
                [fieldName]: prev[fieldName].filter(id => id.toString() !== idStr)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [fieldName]: prev[fieldName].filter(id => id.toString() !== idStr)
            }));
        }
    };

    const RenderSelectedTags = (ids, list, fieldName, isCombo = false) => {
        if (!ids || ids.length === 0) return null;
        return (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px', padding: '8px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                {ids.map(id => {
                    const item = list.find(x => x.id.toString() === id.toString());
                    if (!item) return null;
                    return (
                        <div key={id} style={{ 
                            background: '#eff6ff', 
                            color: '#2563eb', 
                            padding: '4px 10px', 
                            borderRadius: '6px', 
                            fontSize: '0.75rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px',
                            fontWeight: 600,
                            border: '1px solid #bfdbfe'
                        }}>
                            {item.name}
                            <X size={12} style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => handleRemoveTag(id, fieldName, isCombo)} />
                        </div>
                    );
                })}
            </div>
        );
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
            const productsData = Array.isArray(prodRes.data?.results) ? prodRes.data.results : (Array.isArray(prodRes.data) ? prodRes.data : []);
            
            setProducts(productsData);
            setCombos(Array.isArray(comboRes.data?.results) ? comboRes.data.results : (Array.isArray(comboRes.data) ? comboRes.data : []));
            setCategories(Array.isArray(catRes.data?.results) ? catRes.data.results : (Array.isArray(catRes.data) ? catRes.data : []));
            setBrands(Array.isArray(brandRes.data?.results) ? brandRes.data.results : (Array.isArray(brandRes.data) ? brandRes.data : []));
            setMakes(Array.isArray(makeRes.data?.results) ? makeRes.data.results : (Array.isArray(makeRes.data) ? makeRes.data : []));
            setStates(Array.isArray(stateRes.data?.results) ? stateRes.data.results : (Array.isArray(stateRes.data) ? stateRes.data : []));
            
            console.log('Inventory loaded successfully:', { count: productsData.length, comboCount: (Array.isArray(comboRes.data?.results) ? comboRes.data.results : (Array.isArray(comboRes.data) ? comboRes.data : [])).length });
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
        const timeoutId = setTimeout(() => {
            fetchData(searchTerm, categoryFilter, brandFilter, statusFilter);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, categoryFilter, brandFilter, statusFilter]);

    // Fetch models when make changes
    useEffect(() => {
        const fetchModels = async () => {
            const makeIds = (activeTab === 'products' ? formData.make : comboFormData.make) || [];
            if (makeIds.length > 0) {
                try {
                    // Fetch for all selected makes and combine
                    const responses = await Promise.all(makeIds.map(id => api.get(`products/models/?make_id=${id}`)));
                    let allModels = [];
                    responses.forEach(res => {
                        const data = res.data.results || res.data;
                        if (Array.isArray(data)) {
                            allModels = [...allModels, ...data];
                        }
                    });
                    setModels(allModels);
                } catch (err) {
                    console.error('Error fetching models:', err);
                }
            } else {
                setModels([]);
            }
        };
        fetchModels();
    }, [formData.make, comboFormData.make, activeTab]);

    // Fetch cities when state changes
    useEffect(() => {
        const fetchCities = async () => {
            const stateIds = (activeTab === 'products' ? formData.state : comboFormData.state) || [];
            if (stateIds.length > 0) {
                try {
                    const responses = await Promise.all(stateIds.map(id => api.get(`locations/cities/?state_id=${id}`)));
                    let allCities = [];
                    responses.forEach(res => {
                        const data = res.data.results || res.data;
                        if (Array.isArray(data)) {
                            allCities = [...allCities, ...data];
                        }
                    });
                    setCities(allCities);
                } catch (err) {
                    console.error('Error fetching cities:', err);
                }
            } else {
                setCities([]);
            }
        };
        fetchCities();
    }, [formData.state, comboFormData.state, activeTab, isModalOpen, isComboModalOpen]);
    
    // Filter available pincodes based on selected cities
    useEffect(() => {
        const selectedCityIds = (activeTab === 'products' ? formData.city : comboFormData.city) || [];
        // Flatten pincodes from selected cities
        const pins = cities
            .filter(c => selectedCityIds.some(id => id.toString() === c.id.toString()))
            .flatMap(c => (c.pincodes || []).map(p => ({ ...p, name: `${p.pincode} (${c.name})` })));
        setAvailablePincodes(pins);
    }, [formData.city, comboFormData.city, cities, activeTab, isModalOpen, isComboModalOpen]);

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
        setActiveTab('products');
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                slug: product.slug,
                sku: product.sku,
                description: product.description,
                price: product.price,
                stock: product.stock,
                category: product.category || [],
                brand: product.brand || [],
                is_active: product.is_active,
                warranty: product.warranty || '',
                make: product.make || [],
                model: product.model || [],
                state: product.state || [],
                city: product.city || [],
                pincodes: product.pincodes || [],
                exchange_available: product.exchange_available || false,
                exchange_discount: product.exchange_discount || 0,
                images: product.images ? product.images.map(img => ({ id: img.id, url: img.image, is_primary: img.is_primary })) : []
            });
            // Reset image/spec state for editing
            const existingSpecs = product.specifications && product.specifications.length > 0
                ? product.specifications.map(s => ({ key: s.key, value: s.value }))
                : [{ key: '', value: '' }];
            setSpecRows(existingSpecs);
            setPrimaryImageIndex(product.images ? product.images.findIndex(img => img.is_primary) : null);
        } else {
            setEditingProduct(null);
            setFormData({
                name: '', slug: '', sku: '', description: '', price: '', stock: '',
                category: [], brand: [], is_active: true, warranty: '',
                make: [], model: [], state: [], city: [],
                exchange_available: false, exchange_discount: 0
            });
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
            
            // Append M2M fields
            formData.category.forEach(id => productFd.append('category', id));
            formData.brand.forEach(id => productFd.append('brand', id));
            formData.make.forEach(id => productFd.append('make', id));
            formData.model.forEach(id => productFd.append('model', id));
            formData.state.forEach(id => productFd.append('state', id));
            formData.city.forEach(id => productFd.append('city', id));
            formData.pincodes.forEach(id => productFd.append('pincodes', id));

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
            const imagesToUpload = formData.images?.filter(img => img.file) || [];
            if (imagesToUpload.length > 0) {
                console.log('--- STEP 2: UPLOAD IMAGES ---');
                for (let i = 0; i < formData.images.length; i++) {
                    const img = formData.images[i];
                    if (img.file) {
                        const fd = new FormData();
                        fd.append('product', productId);
                        fd.append('image', img.file);
                        fd.append('is_primary', i === primaryImageIndex);

                        await api.post('products/product-images/', fd, {
                            headers: {
                                'Content-Type': 'multipart/form-data'
                            }
                        });
                    }
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

            let errorMessage = 'Operation failed. Please check the Developer Console for detailed API errors.';
            if (err.response?.data) {
                const data = err.response.data;
                if (data.make) errorMessage = data.make[0];
                else if (data.model) errorMessage = data.model[0];
                else if (data.non_field_errors) errorMessage = data.non_field_errors[0];
            }
            alert(errorMessage);
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

    const handleOpenComboModal = (combo = null) => {
        setActiveTab('combos');
        if (combo) {
            setEditingCombo(combo);
            setComboFormData({
                name: combo.name,
                slug: combo.slug,
                sku: combo.sku,
                price: combo.price,
                inverter: combo.inverter,
                battery: combo.battery,
                is_active: combo.is_active,
                warranty: combo.warranty || '',
                make: combo.make || [],
                model: combo.model || [],
                state: combo.state || [],
                city: combo.city || [],
                pincodes: combo.pincodes || [],
                category: combo.category || [],
                brand: combo.brand || [],
                description: combo.description || '',
                special_price: combo.special_price || '',
                exchange_available: combo.exchange_available || false,
                exchange_discount: combo.exchange_discount || 0
            });
            // Load existing images
            if (combo.images) {
                setComboImages(combo.images.map(img => ({
                    id: img.id,
                    url: img.image,
                    is_primary: img.is_primary
                })));
                const primaryIdx = combo.images.findIndex(img => img.is_primary);
                setComboPrimaryImageIndex(primaryIdx >= 0 ? primaryIdx : null);
            }
            // Load existing specifications
            if (combo.specifications && combo.specifications.length > 0) {
                setComboSpecRows(combo.specifications.map(s => ({ key: s.key, value: s.value })));
            } else {
                setComboSpecRows([{ key: '', value: '' }]);
            }
        } else {
            setEditingCombo(null);
            setComboFormData({
                name: '', slug: '', sku: '', price: '', inverter: '', battery: '',
                is_active: true, warranty: '', make: [], model: [], state: [], city: [],
                category: [], brand: [], description: '', special_price: '',
                exchange_available: false, exchange_discount: 0
            });
            setComboImages([]);
            setComboSpecRows([{ key: '', value: '' }]);
            setComboPrimaryImageIndex(null);
        }
        setIsComboModalOpen(true);
    };

    const handleComboSubmit = async (e) => {
        e.preventDefault();
        setComboSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('name', comboFormData.name);
            fd.append('slug', comboFormData.slug);
            fd.append('sku', comboFormData.sku);
            fd.append('price', comboFormData.price);
            fd.append('inverter', comboFormData.inverter);
            fd.append('battery', comboFormData.battery);
            fd.append('is_active', comboFormData.is_active);
            fd.append('description', comboFormData.description);
            if (comboFormData.special_price) fd.append('special_price', comboFormData.special_price);
            fd.append('exchange_available', comboFormData.exchange_available);
            fd.append('exchange_discount', comboFormData.exchange_discount);

            if (comboFormData.warranty) fd.append('warranty', comboFormData.warranty);
            
            // Append M2M fields
            comboFormData.category.forEach(id => fd.append('category', id));
            comboFormData.brand.forEach(id => fd.append('brand', id));
            comboFormData.make.forEach(id => fd.append('make', id));
            comboFormData.model.forEach(id => fd.append('model', id));
            comboFormData.state.forEach(id => fd.append('state', id));
            comboFormData.city.forEach(id => fd.append('city', id));
            comboFormData.pincodes.forEach(id => fd.append('pincodes', id));


            let comboResponse;
            if (editingCombo) {
                comboResponse = await api.put(`products/combos/${editingCombo.id}/`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                comboResponse = await api.post('products/combos/', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            const comboId = editingCombo ? editingCombo.id : comboResponse.data.id;

            // Step 2: Upload images
            const imagesToUpload = comboImages.filter(img => img.file);
            if (imagesToUpload.length > 0) {
                for (let i = 0; i < comboImages.length; i++) {
                    const img = comboImages[i];
                    if (img.file) {
                        const imageFd = new FormData();
                        imageFd.append('combo_product', comboId);
                        imageFd.append('image', img.file);
                        imageFd.append('is_primary', i === comboPrimaryImageIndex);

                        await api.post('products/combo-product-images/', imageFd, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                        });
                    }
                }
            }

            // Step 3: Add specifications
            const specsToSend = comboSpecRows.filter(r => r.key && r.value);
            if (specsToSend.length > 0) {
                for (const spec of specsToSend) {
                    await api.post('products/combo-product-specifications/', {
                        combo_product: comboId,
                        key: spec.key,
                        value: spec.value
                    });
                }
            }

            setIsComboModalOpen(false);
            fetchData();
            alert(`Combo ${editingCombo ? 'updated' : 'created'} successfully!`);
        } catch (err) {
            console.error('Combo Error:', err.response?.data);
            const errorMsg = err.response?.data?.make?.[0] || err.response?.data?.model?.[0] || err.response?.data?.non_field_errors?.[0] || 'Operation failed. Check console.';
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

        const newImages = files.map(file => ({
            url: URL.createObjectURL(file),
            file: file,
            is_primary: false
        }));

        setFormData(prev => {
            const updatedImages = [...(prev.images || []), ...newImages];
            if (primaryImageIndex === null && updatedImages.length > 0) {
                setPrimaryImageIndex(0);
            }
            return { ...prev, images: updatedImages };
        });

        // Reset file input so same files can be selected again if removed
        e.target.value = null;
    };

    const removeImage = async (indexToRemove) => {
        const imageToRemove = formData.images[indexToRemove];

        if (imageToRemove.id) {
            if (window.confirm('Are you sure you want to delete this image?')) {
                try {
                    await api.delete(`products/product-images/${imageToRemove.id}/`);
                    // We don't fetch data immediately to avoid resetting the form
                } catch (err) {
                    alert('Failed to delete image from server.');
                    return;
                }
            } else {
                return;
            }
        }

        setFormData(prev => {
            const newImages = [...prev.images];
            newImages.splice(indexToRemove, 1);
            return { ...prev, images: newImages };
        });

        if (primaryImageIndex === indexToRemove) {
            setPrimaryImageIndex(null);
        } else if (primaryImageIndex > indexToRemove) {
            setPrimaryImageIndex(primaryImageIndex - 1);
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

    const getCategoryName = (ids) => {
        if (!ids || (Array.isArray(ids) && ids.length === 0)) return 'Uncategorized';
        const idList = Array.isArray(ids) ? ids : [ids];
        const names = idList.map(id => {
            const cat = categories.find(c => c.id === parseInt(id));
            return cat ? cat.name : null;
        }).filter(Boolean);
        return names.length > 0 ? names.join(', ') : 'Uncategorized';
    };

    const getBrandName = (ids) => {
        if (!ids || (Array.isArray(ids) && ids.length === 0)) return 'Generic';
        const idList = Array.isArray(ids) ? ids : [ids];
        const names = idList.map(id => {
            const brand = brands.find(b => b.id === parseInt(id));
            return brand ? brand.name : null;
        }).filter(Boolean);
        return names.length > 0 ? names.join(', ') : 'Generic';
    };

    // Only show standard (non-combo) products in the Standard Products tab
    const filteredProducts = products.filter(p => p.product_type === 'single');

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
                                onClick={() => { setActiveTab('combos'); setIsComboModalOpen(true); }}
                                className="glass action-btn"
                                style={{ padding: '0.6rem 1rem', borderRadius: '10px', color: 'black', border: 'none', background: 'var(--grad-blue, #166fdc)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
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
                    Standard Products ({filteredProducts.length})
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

            {error && (
                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', color: '#b91c1c' }}>
                    <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                    <p style={{ fontWeight: 600 }}>{error}</p>
                    <button onClick={() => fetchData()} style={{ marginLeft: 'auto', background: '#ef4444', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>Retry</button>
                </div>
            )}

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
                                    <th style={{ padding: '1.25rem' }}>Image</th>
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
                                ) : (filteredProducts?.length || 0) === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                                            {searchTerm ? 'No products found matching your search.' : 'No products available in inventory.'}
                                        </td>
                                    </tr>
                                ) : filteredProducts.map((p) => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid var(--glass-border)' }} className="table-row">
                                        <td style={{ padding: '1.25rem' }}>
                                            <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                                {p.images && p.images.length > 0 ? (
                                                    <img src={p.images.find(img => img.is_primary)?.image || p.images[0].image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                                                        <Box size={20} />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
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
                                    <th style={{ padding: '1.25rem' }}>Image</th>
                                    <th style={{ padding: '1.25rem' }}>Combo Name</th>
                                    <th style={{ padding: '1.25rem' }}>Components</th>
                                    <th style={{ padding: '1.25rem' }}>Price</th>
                                    <th style={{ padding: '1.25rem' }}>Status</th>
                                    <th style={{ padding: '1.25rem', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(combos?.length || 0) === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                                            No combo packs available.
                                        </td>
                                    </tr>
                                ) : combos.map((c) => (
                                    <tr key={c.id} style={{ borderBottom: '1px solid var(--glass-border)' }} className="table-row">
                                        <td style={{ padding: '1.25rem' }}>
                                            <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                                {c.image ? (
                                                    <img src={c.image} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                                                        <Box size={20} />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem' }}>
                                            <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{c.name}</div>
                                        </td>
                                        <td style={{ padding: '1.25rem' }}>
                                            <div style={{ fontSize: '0.85rem' }}>
                                                <strong>Inverter:</strong> {c.inverter_name}<br />
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
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <button onClick={() => handleOpenComboModal(c)} className="action-btn" style={{ padding: '6px', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.2)', cursor: 'pointer', background: 'transparent', color: '#3b82f6' }}>
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteCombo(c.id)} className="action-btn delete" style={{ padding: '6px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', background: 'transparent', color: '#ef4444' }}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
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
                                    <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                </div>
                                <div className="input-group">
                                    <label>Stock</label>
                                    <input required type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
                                </div>
                                <div className="input-group">
                                    <label>Warranty</label>
                                    <input value={formData.warranty} onChange={e => setFormData({ ...formData, warranty: e.target.value })} placeholder="e.g. 1 Year, 6 Months" />
                                </div>
                                <div className="input-group">
                                    <label>Categories (Multi-select)</label>
                                    <select multiple style={{ height: '100px' }} value={formData.category} onChange={e => setFormData({ ...formData, category: Array.from(e.target.selectedOptions, o => o.value) })}>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    {RenderSelectedTags(formData.category, categories, 'category')}
                                </div>
                                <div className="input-group">
                                    <label>Brands (Multi-select)</label>
                                    <select multiple style={{ height: '100px' }} value={formData.brand} onChange={e => setFormData({ ...formData, brand: Array.from(e.target.selectedOptions, o => o.value) })}>
                                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                    {RenderSelectedTags(formData.brand, brands, 'brand')}
                                </div>
                                <div className="input-group">
                                    <label>Vehicle Makes (Multi-select)</label>
                                    <select multiple style={{ height: '100px' }} value={formData.make} onChange={e => setFormData({ ...formData, make: Array.from(e.target.selectedOptions, o => o.value) })}>
                                        {makes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                    {RenderSelectedTags(formData.make, makes, 'make')}
                                </div>
                                <div className="input-group">
                                    <label>Vehicle Models (Multi-select)</label>
                                    <select multiple style={{ height: '100px' }} value={formData.model} onChange={e => setFormData({ ...formData, model: Array.from(e.target.selectedOptions, o => o.value) })}>
                                        {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                    {RenderSelectedTags(formData.model, models, 'model')}
                                </div>
                                <div className="input-group">
                                    <label>States (Multi-select)</label>
                                    <select multiple style={{ height: '100px' }} value={formData.state} onChange={e => setFormData({ ...formData, state: Array.from(e.target.selectedOptions, o => o.value) })}>
                                        {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                    {RenderSelectedTags(formData.state, states, 'state')}
                                </div>
                                <div className="input-group">
                                    <label>Cities (Multi-select)</label>
                                    <select multiple style={{ height: '100px' }} value={formData.city} onChange={e => setFormData({ ...formData, city: Array.from(e.target.selectedOptions, o => o.value) })}>
                                        {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    {RenderSelectedTags(formData.city, cities, 'city')}
                                </div>
                                <div className="input-group">
                                    <label>Pincodes (Multi-select)</label>
                                    <select multiple style={{ height: '100px' }} value={formData.pincodes} onChange={e => setFormData({ ...formData, pincodes: Array.from(e.target.selectedOptions, o => o.value) })} disabled={formData.city.length === 0}>
                                        {availablePincodes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                    {RenderSelectedTags(formData.pincodes, availablePincodes, 'pincodes')}
                                    {formData.city.length === 0 && <p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Select cities first to see available pincodes.</p>}
                                </div>
                                <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '25px' }}>
                                    <input
                                        type="checkbox"
                                        id="exchange_available"
                                        checked={formData.exchange_available}
                                        onChange={e => setFormData({ ...formData, exchange_available: e.target.checked })}
                                    />
                                    <label htmlFor="exchange_available" style={{ margin: 0 }}>Exchange Available</label>
                                </div>
                                {formData.exchange_available && (
                                    <div className="input-group">
                                        <label>Exchange Discount (₹)</label>
                                        <input
                                            type="number"
                                            value={formData.exchange_discount}
                                            onChange={e => setFormData({ ...formData, exchange_discount: e.target.value })}
                                            placeholder="Discount amount for old battery"
                                        />
                                    </div>
                                )}
                                <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '25px' }}>
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={formData.is_active}
                                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                    />
                                    <label htmlFor="is_active" style={{ margin: 0 }}>Product Active/Visible</label>
                                </div>
                                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                    <label>Description</label>
                                    <textarea rows="3" required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                </div>
                                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                    <label>Images</label>
                                    <input type="file" multiple onChange={handleImageUpload} />
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                                        {formData.images?.map((img, idx) => (
                                            <div key={idx} style={{ position: 'relative', width: '80px', height: '80px' }}>
                                                <img
                                                    src={img.url}
                                                    alt="preview"
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        borderRadius: '8px',
                                                        border: idx === primaryImageIndex ? '2px solid var(--red-main)' : 'none'
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(idx)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '-5px', right: '-5px',
                                                        background: 'white',
                                                        color: '#ef4444',
                                                        border: '1px solid #ef4444',
                                                        borderRadius: '50%',
                                                        width: '20px', height: '20px',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        cursor: 'pointer', padding: 0, zIndex: 10
                                                    }}>
                                                    <X size={12} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setPrimaryImageIndex(idx)}
                                                    style={{
                                                        position: 'absolute',
                                                        bottom: 0, left: 0, right: 0,
                                                        fontSize: '0.6rem',
                                                        background: idx === primaryImageIndex ? 'var(--red-main)' : 'rgba(0,0,0,0.7)',
                                                        color: 'white',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        padding: '4px 0',
                                                        borderBottomLeftRadius: '8px',
                                                        borderBottomRightRadius: '8px'
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
                            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#000' }}>{editingCombo ? 'Edit Combo Pack' : 'Create Combo Pack'}</h2>
                            <button type="button" onClick={() => setIsComboModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="input-group">
                                        <label>Combo Name</label>
                                        <input required value={comboFormData.name} onChange={e => handleComboNameChange(e.target.value)} placeholder="e.g. Inverter + 150Ah Battery" />
                                    </div>
                                    <div className="input-group">
                                        <label>Slug (URL key)</label>
                                        <input required value={comboFormData.slug} onChange={e => setComboFormData({ ...comboFormData, slug: e.target.value })} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="input-group">
                                        <label>SKU</label>
                                        <input required value={comboFormData.sku} onChange={e => setComboFormData({ ...comboFormData, sku: e.target.value })} placeholder="COMBO-001" />
                                    </div>
                                    <div className="input-group">
                                        <label>Combo Price (₹)</label>
                                        <input required type="number" step="0.01" value={comboFormData.price} onChange={e => setComboFormData({ ...comboFormData, price: e.target.value })} />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Warranty</label>
                                    <input value={comboFormData.warranty} onChange={e => setComboFormData({ ...comboFormData, warranty: e.target.value })} placeholder="e.g. 24 Months" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div className="input-group">
                                        <label>Select Inverter</label>
                                        <select required value={comboFormData.inverter} onChange={e => setComboFormData({ ...comboFormData, inverter: e.target.value })}>
                                            <option value="">Select a Product</option>
                                            {products.filter(p => getCategoryName(p.category).toLowerCase().includes('inverter')).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            {/* Fallback to all if no inverter category found */}
                                            {products.filter(p => !getCategoryName(p.category).toLowerCase().includes('inverter')).length > 0 && products.filter(p => getCategoryName(p.category).toLowerCase().includes('inverter')).length === 0 && products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label>Select Battery</label>
                                        <select required value={comboFormData.battery} onChange={e => setComboFormData({ ...comboFormData, battery: e.target.value })}>
                                            <option value="">Select a Product</option>
                                            {products.filter(p => getCategoryName(p.category).toLowerCase().includes('battery')).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            {/* Fallback to all if no battery category found */}
                                            {products.filter(p => !getCategoryName(p.category).toLowerCase().includes('battery')).length > 0 && products.filter(p => getCategoryName(p.category).toLowerCase().includes('battery')).length === 0 && products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="input-group">
                                        <label>Special Price (₹) - Optional</label>
                                        <input type="number" step="0.01" value={comboFormData.special_price} onChange={e => setComboFormData({ ...comboFormData, special_price: e.target.value })} />
                                    </div>
                                    <div className="input-group">
                                        <label>Description</label>
                                        <textarea rows="2" value={comboFormData.description} onChange={e => setComboFormData({ ...comboFormData, description: e.target.value })} />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="input-group">
                                        <label>Categories (Multi-select)</label>
                                        <select multiple style={{ height: '100px' }} value={comboFormData.category} onChange={e => setComboFormData({ ...comboFormData, category: Array.from(e.target.selectedOptions, o => o.value) })}>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                        {RenderSelectedTags(comboFormData.category, categories, 'category', true)}
                                    </div>
                                    <div className="input-group">
                                        <label>Brands (Multi-select)</label>
                                        <select multiple style={{ height: '100px' }} value={comboFormData.brand} onChange={e => setComboFormData({ ...comboFormData, brand: Array.from(e.target.selectedOptions, o => o.value) })}>
                                            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                        </select>
                                        {RenderSelectedTags(comboFormData.brand, brands, 'brand', true)}
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="input-group">
                                        <label>Vehicle Makes (Multi-select)</label>
                                        <select multiple style={{ height: '100px' }} value={comboFormData.make} onChange={e => setComboFormData({ ...comboFormData, make: Array.from(e.target.selectedOptions, o => o.value) })}>
                                            {makes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                        </select>
                                        {RenderSelectedTags(comboFormData.make, makes, 'make', true)}
                                    </div>
                                    <div className="input-group">
                                        <label>Vehicle Models (Multi-select)</label>
                                        <select multiple style={{ height: '100px' }} value={comboFormData.model} onChange={e => setComboFormData({ ...comboFormData, model: Array.from(e.target.selectedOptions, o => o.value) })}>
                                            {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                        </select>
                                        {RenderSelectedTags(comboFormData.model, models, 'model', true)}
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="input-group">
                                        <label>States (Multi-select)</label>
                                        <select multiple style={{ height: '100px' }} value={comboFormData.state} onChange={e => setComboFormData({ ...comboFormData, state: Array.from(e.target.selectedOptions, o => o.value) })}>
                                            {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                        {RenderSelectedTags(comboFormData.state, states, 'state', true)}
                                    </div>
                                    <div className="input-group">
                                        <label>Cities (Multi-select)</label>
                                        <select multiple style={{ height: '100px' }} value={comboFormData.city} onChange={e => setComboFormData({ ...comboFormData, city: Array.from(e.target.selectedOptions, o => o.value) })}>
                                            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                        {RenderSelectedTags(comboFormData.city, cities, 'city', true)}
                                    </div>
                                    <div className="input-group">
                                        <label>Pincodes (Multi-select)</label>
                                        <select multiple style={{ height: '100px' }} value={comboFormData.pincodes} onChange={e => setComboFormData({ ...comboFormData, pincodes: Array.from(e.target.selectedOptions, o => o.value) })} disabled={comboFormData.city.length === 0}>
                                            {availablePincodes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                        {RenderSelectedTags(comboFormData.pincodes, availablePincodes, 'pincodes', true)}
                                        {comboFormData.city.length === 0 && <p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Select cities first to see available pincodes.</p>}
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexDirection: 'row' }}>
                                        <input
                                            type="checkbox"
                                            id="combo_exchange_available"
                                            checked={comboFormData.exchange_available}
                                            onChange={e => setComboFormData({ ...comboFormData, exchange_available: e.target.checked })}
                                        />
                                        <label htmlFor="combo_exchange_available" style={{ margin: 0 }}>Exchange Available</label>
                                    </div>
                                    {comboFormData.exchange_available && (
                                        <div className="input-group">
                                            <label>Exchange Discount (₹)</label>
                                            <input type="number" value={comboFormData.exchange_discount} onChange={e => setComboFormData({ ...comboFormData, exchange_discount: e.target.value })} />
                                        </div>
                                    )}
                                </div>

                                {comboFormData.inverter && comboFormData.battery && (
                                    <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                        <div style={{ fontSize: '0.85rem', color: '#1d4ed8', fontWeight: 700 }}>Virtual Combo Stock Available: </div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e40af' }}>
                                            {Math.min(
                                                products.find(p => p.id == comboFormData.inverter)?.stock || 0,
                                                products.find(p => p.id == comboFormData.battery)?.stock || 0
                                            )} units
                                        </div>
                                    </div>
                                )}

                                <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexDirection: 'row' }}>
                                    <input
                                        type="checkbox"
                                        id="combo_is_active"
                                        checked={comboFormData.is_active}
                                        onChange={e => setComboFormData({ ...comboFormData, is_active: e.target.checked })}
                                    />
                                    <label htmlFor="combo_is_active" style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>Combo Active/Visible</label>
                                </div>

                                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                    <label>Combo Images</label>
                                    <input type="file" multiple onChange={handleComboImageUpload} />
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                                        {comboImages.map((img, idx) => (
                                            <div key={idx} style={{ position: 'relative', width: '80px', height: '80px' }}>
                                                <img
                                                    src={img.url}
                                                    alt="preview"
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        borderRadius: '8px',
                                                        border: idx === comboPrimaryImageIndex ? '2px solid var(--primary-glow)' : 'none'
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeComboImage(idx)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '-5px', right: '-5px',
                                                        background: 'white',
                                                        color: '#ef4444',
                                                        border: '1px solid #ef4444',
                                                        borderRadius: '50%',
                                                        width: '20px', height: '20px',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        cursor: 'pointer', padding: 0, zIndex: 10
                                                    }}>
                                                    <X size={12} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setComboPrimaryImageIndex(idx)}
                                                    style={{
                                                        position: 'absolute',
                                                        bottom: 0, left: 0, right: 0,
                                                        fontSize: '0.6rem',
                                                        background: idx === comboPrimaryImageIndex ? 'var(--primary-glow)' : 'rgba(255,255,255,0.9)',
                                                        color: idx === comboPrimaryImageIndex ? 'white' : 'black',
                                                        border: 'none',
                                                        padding: '2px',
                                                        cursor: 'pointer',
                                                        borderBottomLeftRadius: '8px',
                                                        borderBottomRightRadius: '8px'
                                                    }}>
                                                    {idx === comboPrimaryImageIndex ? 'Primary' : 'Set Primary'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <label style={{ margin: 0 }}>Combo Specifications</label>
                                        <button type="button" onClick={handleAddComboSpecRow} style={{ padding: '4px 12px', borderRadius: '6px', background: 'var(--primary-glow)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>+ Add Row</button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {comboSpecRows.map((row, idx) => (
                                            <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <input
                                                    placeholder="Feature (e.g. Battery Life)"
                                                    style={{ flex: 1 }}
                                                    value={row.key}
                                                    onChange={(e) => handleComboSpecChange(idx, 'key', e.target.value)}
                                                />
                                                <input
                                                    placeholder="Value (e.g. 5 Years)"
                                                    style={{ flex: 1 }}
                                                    value={row.value}
                                                    onChange={(e) => handleComboSpecChange(idx, 'value', e.target.value)}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeComboSpecRow(idx)}
                                                    style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                                    disabled={comboSpecRows.length === 1}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '1rem', justifyContent: 'flex-end', background: '#fff' }}>
                            <button type="button" onClick={() => setIsComboModalOpen(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: 'transparent', border: '1px solid #ced4da', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                            <button type="submit" disabled={comboSubmitting} style={{
                                padding: '0.75rem 2rem', borderRadius: '12px', background: 'var(--grad-blue, #3b82f6)', border: 'none', color: 'white', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                            }}>
                                {comboSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} {editingCombo ? 'Update Combo' : 'Create Combo'}
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
