import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ShopSettings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  const [shopData, setShopData] = useState({
    general: {
      shopName: '',
      description: '',
      logo: null,
      logoPreview: '',
      email: '',
      phone: '',
      website: ''
    },
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    business: {
      taxId: '',
      registrationNumber: '',
      businessType: 'individual',
      yearEstablished: ''
    },
    shipping: {
      methods: [
        { id: 1, name: 'Standard Shipping', price: 5.99, estimatedDays: '3-5', isActive: true },
        { id: 2, name: 'Express Shipping', price: 15.99, estimatedDays: '1-2', isActive: true }
      ],
      freeShippingThreshold: 50
    },
    payment: {
      acceptedMethods: {
        creditCard: true,
        paypal: true,
        applePay: false,
        googlePay: false
      },
      currency: 'USD'
    }
  });
  
  // Fetch shop data
  useEffect(() => {
    const fetchShopData = async () => {
      try {
        const response = await axios.get('/api/shop');
        
        // Format and merge the data
        const formattedData = {
          general: {
            shopName: response.data.shopName || '',
            description: response.data.description || '',
            logoPreview: response.data.logo || '',
            email: response.data.contact?.email || '',
            phone: response.data.contact?.phone || '',
            website: response.data.contact?.website || ''
          },
          address: {
            street: response.data.address?.street || '',
            city: response.data.address?.city || '',
            state: response.data.address?.state || '',
            zipCode: response.data.address?.zipCode || '',
            country: response.data.address?.country || ''
          },
          business: {
            taxId: response.data.businessInfo?.taxId || '',
            registrationNumber: response.data.businessInfo?.registrationNumber || '',
            businessType: response.data.businessInfo?.businessType || 'individual',
            yearEstablished: response.data.businessInfo?.yearEstablished || ''
          },
          shipping: response.data.shipping || shopData.shipping,
          payment: response.data.payment || shopData.payment
        };
        
        setShopData(formattedData);
        setError('');
      } catch (error) {
        setError('Failed to fetch shop information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchShopData();
  }, []);
  
  // Handle general info form changes
  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setShopData({
      ...shopData,
      general: {
        ...shopData.general,
        [name]: value
      }
    });
  };
  
  // Handle logo change
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setShopData({
        ...shopData,
        general: {
          ...shopData.general,
          logo: file,
          logoPreview: URL.createObjectURL(file)
        }
      });
    }
  };
  
  // Handle address form changes
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShopData({
      ...shopData,
      address: {
        ...shopData.address,
        [name]: value
      }
    });
  };
  
  // Handle business info form changes
  const handleBusinessChange = (e) => {
    const { name, value } = e.target;
    setShopData({
      ...shopData,
      business: {
        ...shopData.business,
        [name]: value
      }
    });
  };
  
  // Handle shipping method changes
  const handleShippingMethodChange = (id, field, value) => {
    const updatedMethods = shopData.shipping.methods.map(method => {
      if (method.id === id) {
        return { ...method, [field]: value };
      }
      return method;
    });
    
    setShopData({
      ...shopData,
      shipping: {
        ...shopData.shipping,
        methods: updatedMethods
      }
    });
  };
  
  // Add new shipping method
  const addShippingMethod = () => {
    const newMethod = {
      id: Date.now(), // Use timestamp as temporary ID
      name: 'New Shipping Method',
      price: 0,
      estimatedDays: '3-5',
      isActive: true
    };
    
    setShopData({
      ...shopData,
      shipping: {
        ...shopData.shipping,
        methods: [...shopData.shipping.methods, newMethod]
      }
    });
  };
  
  // Remove shipping method
  const removeShippingMethod = (id) => {
    const updatedMethods = shopData.shipping.methods.filter(method => method.id !== id);
    
    setShopData({
      ...shopData,
      shipping: {
        ...shopData.shipping,
        methods: updatedMethods
      }
    });
  };
  
  // Handle free shipping threshold change
  const handleFreeShippingChange = (e) => {
    const value = parseFloat(e.target.value);
    setShopData({
      ...shopData,
      shipping: {
        ...shopData.shipping,
        freeShippingThreshold: value
      }
    });
  };
  
  // Handle payment method toggle
  const handlePaymentMethodToggle = (method) => {
    setShopData({
      ...shopData,
      payment: {
        ...shopData.payment,
        acceptedMethods: {
          ...shopData.payment.acceptedMethods,
          [method]: !shopData.payment.acceptedMethods[method]
        }
      }
    });
  };
  
  // Handle currency change
  const handleCurrencyChange = (e) => {
    setShopData({
      ...shopData,
      payment: {
        ...shopData.payment,
        currency: e.target.value
      }
    });
  };
  
  // Save shop settings
  const saveSettings = async (section) => {
    setSuccess('');
    setError('');
    
    try {
      // Different endpoints/data for different sections
      let endpoint = '/api/shop';
      let data = {};
      
      switch (section) {
        case 'general':
          // Create form data to handle file upload
          const formData = new FormData();
          formData.append('shopName', shopData.general.shopName);
          formData.append('description', shopData.general.description);
          formData.append('email', shopData.general.email);
          formData.append('phone', shopData.general.phone);
          formData.append('website', shopData.general.website);
          
          if (shopData.general.logo) {
            formData.append('logo', shopData.general.logo);
          }
          
          await axios.put(`${endpoint}/general`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          break;
          
        case 'address':
          data = shopData.address;
          await axios.put(`${endpoint}/address`, data);
          break;
          
        case 'business':
          data = shopData.business;
          await axios.put(`${endpoint}/business`, data);
          break;
          
        case 'shipping':
          data = shopData.shipping;
          await axios.put(`${endpoint}/shipping`, data);
          break;
          
        case 'payment':
          data = shopData.payment;
          await axios.put(`${endpoint}/payment`, data);
          break;
          
        default:
          throw new Error('Invalid section');
      }
      
      setSuccess(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.message || `Failed to save ${section} settings`);
    }
  };

  if (loading) {
    return <div>Loading shop settings...</div>;
  }

  return (
    <div className="shop-settings-container">
      <h2>Shop Settings</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <div className="settings-tabs">
        <button 
          className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button 
          className={`tab-button ${activeTab === 'address' ? 'active' : ''}`}
          onClick={() => setActiveTab('address')}
        >
          Address
        </button>
        <button 
          className={`tab-button ${activeTab === 'business' ? 'active' : ''}`}
          onClick={() => setActiveTab('business')}
        >
          Business Info
        </button>
        <button 
          className={`tab-button ${activeTab === 'shipping' ? 'active' : ''}`}
          onClick={() => setActiveTab('shipping')}
        >
          Shipping
        </button>
        <button 
          className={`tab-button ${activeTab === 'payment' ? 'active' : ''}`}
          onClick={() => setActiveTab('payment')}
        >
          Payment
        </button>
      </div>
      
      <div className="settings-content">
        {/* General Info Settings */}
        {activeTab === 'general' && (
          <div className="general-settings">
            <h3>General Information</h3>
            <form onSubmit={(e) => { e.preventDefault(); saveSettings('general'); }}>
              <div className="form-group">
                <label>Shop Name</label>
                <input
                  type="text"
                  name="shopName"
                  value={shopData.general.shopName}
                  onChange={handleGeneralChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={shopData.general.description}
                  onChange={handleGeneralChange}
                  rows="4"
                />
              </div>
              
              <div className="form-group">
                <label>Shop Logo</label>
                <div className="logo-upload">
                  {shopData.general.logoPreview && (
                    <div className="logo-preview">
                      <img src={shopData.general.logoPreview} alt="Shop Logo" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                  />
                  <small>Recommended size: 200 x 200 pixels. Max file size: 2MB.</small>
                </div>
              </div>
              
              <div className="form-group">
                <label>Contact Email</label>
                <input
                  type="email"
                  name="email"
                  value={shopData.general.email}
                  onChange={handleGeneralChange}
                />
              </div>
              
              <div className="form-group">
                <label>Contact Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={shopData.general.phone}
                  onChange={handleGeneralChange}
                />
              </div>
              
              <div className="form-group">
                <label>Website (optional)</label>
                <input
                  type="url"
                  name="website"
                  value={shopData.general.website}
                  onChange={handleGeneralChange}
                  placeholder="https://www.example.com"
                />
              </div>
              
              <button type="submit" className="btn-primary">Save General Settings</button>
            </form>
          </div>
        )}
        
        {/* Address Settings */}
        {activeTab === 'address' && (
          <div className="address-settings">
            <h3>Shop Address</h3>
            <form onSubmit={(e) => { e.preventDefault(); saveSettings('address'); }}>
              <div className="form-group">
                <label>Street Address</label>
                <input
                  type="text"
                  name="street"
                  value={shopData.address.street}
                  onChange={handleAddressChange}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={shopData.address.city}
                    onChange={handleAddressChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>State/Province</label>
                  <input
                    type="text"
                    name="state"
                    value={shopData.address.state}
                    onChange={handleAddressChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Zip/Postal Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={shopData.address.zipCode}
                    onChange={handleAddressChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    name="country"
                    value={shopData.address.country}
                    onChange={handleAddressChange}
                    required
                  />
                </div>
              </div>
              
              <button type="submit" className="btn-primary">Save Address</button>
            </form>
          </div>
        )}
        
        {/* Business Info Settings */}
        {activeTab === 'business' && (
          <div className="business-settings">
            <h3>Business Information</h3>
            <form onSubmit={(e) => { e.preventDefault(); saveSettings('business'); }}>
              <div className="form-group">
                <label>Business Type</label>
                <select
                  name="businessType"
                  value={shopData.business.businessType}
                  onChange={handleBusinessChange}
                >
                  <option value="individual">Individual / Sole Proprietor</option>
                  <option value="partnership">Partnership</option>
                  <option value="llc">Limited Liability Company (LLC)</option>
                  <option value="corporation">Corporation</option>
                  <option value="nonprofit">Non-Profit Organization</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Tax ID / EIN (optional)</label>
                <input
                  type="text"
                  name="taxId"
                  value={shopData.business.taxId}
                  onChange={handleBusinessChange}
                  placeholder="For business tax purposes"
                />
              </div>
              
              <div className="form-group">
                <label>Business Registration Number (optional)</label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={shopData.business.registrationNumber}
                  onChange={handleBusinessChange}
                />
              </div>
              
              <div className="form-group">
                <label>Year Established</label>
                <input
                  type="number"
                  name="yearEstablished"
                  value={shopData.business.yearEstablished}
                  onChange={handleBusinessChange}
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
              
              <button type="submit" className="btn-primary">Save Business Information</button>
            </form>
          </div>
        )}
        
        {/* Shipping Settings */}
        {activeTab === 'shipping' && (
          <div className="shipping-settings">
            <h3>Shipping Methods</h3>
            <div className="shipping-methods">
              {shopData.shipping.methods.map(method => (
                <div key={method.id} className="shipping-method-item">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Method Name</label>
                      <input
                        type="text"
                        value={method.name}
                        onChange={(e) => handleShippingMethodChange(method.id, 'name', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Price ($)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={method.price}
                        onChange={(e) => handleShippingMethodChange(method.id, 'price', parseFloat(e.target.value))}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Estimated Delivery Time (days)</label>
                      <input
                        type="text"
                        value={method.estimatedDays}
                        onChange={(e) => handleShippingMethodChange(method.id, 'estimatedDays', e.target.value)}
                        placeholder="e.g. 3-5"
                      />
                    </div>
                    
                    <div className="form-group checkbox">
                      <label>
                        <input
                          type="checkbox"
                          checked={method.isActive}
                          onChange={(e) => handleShippingMethodChange(method.id, 'isActive', e.target.checked)}
                        />
                        Active
                      </label>
                    </div>
                    
                    <button 
                      type="button" 
                      className="btn-delete"
                      onClick={() => removeShippingMethod(method.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              
              <button 
                type="button" 
                className="btn-secondary"
                onClick={addShippingMethod}
              >
                Add Shipping Method
              </button>
            </div>
            
            <div className="free-shipping-section">
              <h4>Free Shipping</h4>
              <div className="form-group">
                <label>Enable free shipping for orders over:</label>
                <div className="input-with-prefix">
                  <span className="input-prefix">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={shopData.shipping.freeShippingThreshold}
                    onChange={handleFreeShippingChange}
                  />
                </div>
                <small>Set to 0 to disable free shipping</small>
              </div>
            </div>
            
            <button 
              type="button" 
              className="btn-primary"
              onClick={() => saveSettings('shipping')}
            >
              Save Shipping Settings
            </button>
          </div>
        )}
        
        {/* Payment Settings */}
        {activeTab === 'payment' && (
          <div className="payment-settings">
            <h3>Payment Methods</h3>
            <div className="payment-methods">
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={shopData.payment.acceptedMethods.creditCard}
                    onChange={() => handlePaymentMethodToggle('creditCard')}
                  />
                  Credit/Debit Cards
                </label>
              </div>
              
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={shopData.payment.acceptedMethods.paypal}
                    onChange={() => handlePaymentMethodToggle('paypal')}
                  />
                  PayPal
                </label>
              </div>
              
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={shopData.payment.acceptedMethods.applePay}
                    onChange={() => handlePaymentMethodToggle('applePay')}
                  />
                  Apple Pay
                </label>
              </div>
              
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={shopData.payment.acceptedMethods.googlePay}
                    onChange={() => handlePaymentMethodToggle('googlePay')}
                  />
                  Google Pay
                </label>
              </div>
            </div>
            
            <div className="currency-settings">
              <h4>Currency Settings</h4>
              <div className="form-group">
                <label>Store Currency</label>
                <select
                  value={shopData.payment.currency}
                  onChange={handleCurrencyChange}
                >
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="GBP">British Pound (GBP)</option>
                  <option value="CAD">Canadian Dollar (CAD)</option>
                  <option value="AUD">Australian Dollar (AUD)</option>
                  <option value="JPY">Japanese Yen (JPY)</option>
                </select>
              </div>
            </div>
            
            <button 
              type="button" 
              className="btn-primary"
              onClick={() => saveSettings('payment')}
            >
              Save Payment Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopSettings;