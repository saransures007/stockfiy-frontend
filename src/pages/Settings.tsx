// pages/Settings.tsx
import { useState, useEffect } from 'react';
import { InventoryLayout } from '@/layouts';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Settings as SettingsIcon,
  User,
  Store,
  Bell,
  Shield,
  Palette,
  Database,
  Download,
  Upload,
  Trash2,
  Save,
  RefreshCw,
  Globe,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Printer,
  Barcode,
  Package,
  Users,
  TrendingUp,
  Moon,
  Sun,
  Monitor,
  Check,
  AlertTriangle,
  Info,
  Zap,
  Lock,
  Eye,
  EyeOff,
  Camera,
  Smartphone,
  Laptop,
  Tablet,
  Clock,
  Calendar,
  DollarSign,
  Languages,
  HelpCircle,
  Power,
  PowerOff
} from 'lucide-react';
import { apiService } from '@/lib/api';

interface SettingsData {
  general: {
    companyName: string;
    businessType: string;
    currency: string;
    timezone: string;
    language: string;
    dateFormat: string;
    numberFormat: string;
  };
  storeStatus: {
    openingTime: string;
    closingTime: string;
    holidayMode: boolean;
    temporaryCloseReason: string;
    lastStatusChange: string;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    lowStockAlerts: boolean;
    salesNotifications: boolean;
    systemUpdates: boolean;
    marketingEmails: boolean;
    emailRecipients: string[];
    smsNumbers: string[];
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordExpiry: number;
    allowMultipleSessions: boolean;
    ipRestriction: boolean;
    allowedIPs: string[];
  };
  display: {
    theme: string;
    compactMode: boolean;
    showAnimations: boolean;
    highContrast: boolean;
    fontSize: string;
  };
  print: {
    defaultPrinter: string;
    receiptSize: string;
    copies: number;
    headerText: string;
    footerText: string;
    showLogo: boolean;
    showTaxDetails: boolean;
  };
  invoice: {
    prefix: string;
    startingNumber: number;
    terms: string;
    notes: string;
  };
}

export default function Settings() {
  const { theme, setTheme, isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Settings state
  const [generalSettings, setGeneralSettings] = useState({
    companyName: 'Stockify Store',
    businessType: 'Retail',
    currency: 'USD',
    timezone: 'UTC+0',
    language: 'English',
    dateFormat: 'MM/DD/YYYY',
    numberFormat: '1,234.56'
  });

const [storeStatus, setStoreStatus] = useState({
  openingTime: '09:00',
  closingTime: '21:00',
  holidayMode: false,
  temporaryCloseReason: '',
  lastStatusChange: ''
});

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    lowStockAlerts: true,
    salesNotifications: true,
    systemUpdates: false,
    marketingEmails: false,
    emailRecipients: ['admin@stockify.com'],
    smsNumbers: []
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    allowMultipleSessions: true,
    ipRestriction: false,
    allowedIPs: []
  });

  const [displaySettings, setDisplaySettings] = useState({
    theme: theme,
    compactMode: false,
    showAnimations: true,
    highContrast: false,
    fontSize: 'medium'
  });

  const [printSettings, setPrintSettings] = useState({
    defaultPrinter: '',
    receiptSize: '80mm',
    copies: 1,
    headerText: 'Thank you for shopping!',
    footerText: 'Visit us again!',
    showLogo: true,
    showTaxDetails: true
  });

  const [invoiceSettings, setInvoiceSettings] = useState({
    prefix: 'INV',
    startingNumber: 1001,
    terms: 'Payment due within 15 days',
    notes: ''
  });

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await apiService.getSettings();
      if (response.success && response.data) {
        const data = response.data;
        
        setGeneralSettings(data.general || generalSettings);
        setStoreStatus(data.storeStatus || storeStatus);
        setNotificationSettings(data.notifications || notificationSettings);
        setSecuritySettings(data.security || securitySettings);
        setDisplaySettings(data.display || displaySettings);
        setPrintSettings(data.print || printSettings);
        setInvoiceSettings(data.invoice || invoiceSettings);
        
        // Sync theme
        if (data.display?.theme) {
          setTheme(data.display.theme);
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load settings. Using defaults.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGeneralChange = (key: string, value: any) => {
    setGeneralSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleNotificationChange = (key: string, value: any) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSecurityChange = (key: string, value: any) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
  };

  const handleDisplayChange = (key: string, value: any) => {
    setDisplaySettings(prev => ({ ...prev, [key]: value }));
    if (key === 'theme') {
      setTheme(value);
    }
  };

  const handlePrintChange = (key: string, value: any) => {
    setPrintSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleInvoiceChange = (key: string, value: any) => {
    setInvoiceSettings(prev => ({ ...prev, [key]: value }));
  };


const isOpen = (() => {
  if (storeStatus.holidayMode) return false;

  const now = new Date();

  const currentMinutes =
    now.getHours() * 60 + now.getMinutes();

  const [oh, om] =
    storeStatus.openingTime.split(':').map(Number);

  const [ch, cm] =
    storeStatus.closingTime.split(':').map(Number);

  const openMinutes = oh * 60 + om;
  const closeMinutes = ch * 60 + cm;

  return (
    currentMinutes >= openMinutes &&
    currentMinutes < closeMinutes
  );
})();


  const saveSettings = async (section: string) => {
    setSaving(true);
    try {
      let response;
      switch (section) {
        case 'general':
          response = await apiService.updateGeneralSettings(generalSettings);
          break;
        case 'notifications':
          response = await apiService.updateNotificationSettings(notificationSettings);
          break;
        case 'security':
          response = await apiService.updateSecuritySettings(securitySettings);
          break;
        case 'display':
          response = await apiService.updateDisplaySettings(displaySettings);
          break;
        case 'print':
          response = await apiService.updatePrintSettings(printSettings);
          break;
        case 'invoice':
          response = await apiService.updateInvoiceSettings(invoiceSettings);
          break;
        default:
          return;
      }
      
      if (response.success) {
        toast({
          title: 'Success',
          description: `${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully`,
        });
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: 'Error',
        description: `Failed to save ${section} settings`,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = async (section?: string) => {
    if (!confirm(`Are you sure you want to reset ${section ? section : 'all'} settings?`)) return;
    
    try {
      const response = await apiService.resetSettings(section);
      if (response.success) {
        await loadSettings();
        toast({
          title: 'Success',
          description: `${section ? section : 'Settings'} reset to defaults`,
        });
      }
    } catch (error) {
      console.error('Failed to reset settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset settings',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <InventoryLayout activeSection="Settings">
        <div className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </InventoryLayout>
    );
  }

  return (
    <InventoryLayout activeSection="Settings">
      <div className="p-4 md:p-8 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">
        
          
          {/* Enhanced Header with Store Status */}
          <div className={`bg-gradient-to-r ${isOpen ? 'from-green-500/20 via-green-500/10' : 'from-red-500/20 via-red-500/10'} to-transparent rounded-2xl border border-border p-6 md:p-8`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 bg-gradient-to-br ${isOpen ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'} rounded-2xl flex items-center justify-center shadow-lg`}>
                  {isOpen ? (
                    <Power className="h-8 w-8 text-white" />
                  ) : (
                    <PowerOff className="h-8 w-8 text-white" />
                  )}
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                    Settings & Preferences
                  </h1>
                  <p className="text-muted-foreground text-lg mt-2">
                    Customize your Stockify experience and manage your account
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <Badge variant={isOpen ? 'default' : 'destructive'} className="gap-2">
                      {isOpen ? (
                        <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                      ) : (
                        <div className="w-2 h-2 bg-red-300 rounded-full" />
                      )}
                      {isOpen ? 'Store Open' : 'Store Closed'}
                    </Badge>
                    {isOpen && storeStatus.openingTime && (
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {storeStatus.openingTime} - {storeStatus.closingTime}
                      </span>
                    )}
                    {!isOpen && storeStatus.temporaryCloseReason && (
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <AlertTriangle className="h-4 w-4" />
                        {storeStatus.temporaryCloseReason}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                {/* <Button 
                  variant={isOpen ? "destructive" : "default"}
                  onClick={() => handleStoreStatusChange(!isOpen)}
                  className={isOpen ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}
                >
                  {isOpen ? (
                    <>
                      <PowerOff className="h-4 w-4 mr-2" />
                      Close Store
                    </>
                  ) : (
                    <>
                      <Power className="h-4 w-4 mr-2" />
                      Open Store
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => resetSettings()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset All
                </Button> */}
              </div>
            </div>
          </div>

          {/* Settings Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-7 h-auto p-1 bg-muted/50">
              <TabsTrigger value="general" className="flex items-center gap-2 py-3">
                <Store className="h-4 w-4" />
                <span className="hidden sm:inline">General</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2 py-3">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2 py-3">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger value="display" className="flex items-center gap-2 py-3">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Display</span>
              </TabsTrigger>
              <TabsTrigger value="print" className="flex items-center gap-2 py-3">
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">Print</span>
              </TabsTrigger>
              <TabsTrigger value="invoice" className="flex items-center gap-2 py-3">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Invoice</span>
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2 py-3">
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">Advanced</span>
              </TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
  <CardHeader>
    <CardTitle>Store Hours</CardTitle>
    <CardDescription>
      Configure store operating hours
    </CardDescription>
  </CardHeader>

  <CardContent className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>Opening Time</Label>
        <Input
          type="time"
          value={storeStatus.openingTime}
          onChange={(e) =>
            setStoreStatus(prev => ({
              ...prev,
              openingTime: e.target.value
            }))
          }
        />
      </div>

      <div>
        <Label>Closing Time</Label>
        <Input
          type="time"
          value={storeStatus.closingTime}
          onChange={(e) =>
            setStoreStatus(prev => ({
              ...prev,
              closingTime: e.target.value
            }))
          }
        />
      </div>
    </div>

    <div className="flex items-center justify-between">
      <Label>Holiday Mode</Label>

      <Switch
        checked={storeStatus.holidayMode}
        onCheckedChange={(checked) =>
          setStoreStatus(prev => ({
            ...prev,
            holidayMode: checked
          }))
        }
      />
    </div>

    {!isOpen && (
      <Input
        placeholder="Reason for closing"
        value={storeStatus.temporaryCloseReason}
        onChange={(e) =>
          setStoreStatus(prev => ({
            ...prev,
            temporaryCloseReason: e.target.value
          }))
        }
      />
    )}

    <Button
      onClick={async () => {
      await apiService.updateStoreStatus({
        openingTime: storeStatus.openingTime,
        closingTime: storeStatus.closingTime,
        holidayMode: storeStatus.holidayMode,
        temporaryCloseReason:
          storeStatus.temporaryCloseReason
      });
        toast({
          title: "Success",
          description: "Store hours updated"
        });
      }}
    >
      <Save className="h-4 w-4 mr-2" />
      Save Store Hours
    </Button>
  </CardContent>
</Card>

                {/* Company Information */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <Store className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <CardTitle className="text-foreground">Company Information</CardTitle>
                        <CardDescription>Basic details about your business</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={generalSettings.companyName}
                        onChange={(e) => handleGeneralChange('companyName', e.target.value)}
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type</Label>
                      <select
                        id="businessType"
                        value={generalSettings.businessType}
                        onChange={(e) => handleGeneralChange('businessType', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="Retail">Retail</option>
                        <option value="Wholesale">Wholesale</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="E-commerce">E-commerce</option>
                        <option value="Restaurant">Restaurant</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <select
                          id="currency"
                          value={generalSettings.currency}
                          onChange={(e) => handleGeneralChange('currency', e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="INR">INR (₹)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <select
                          id="timezone"
                          value={generalSettings.timezone}
                          onChange={(e) => handleGeneralChange('timezone', e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="UTC+0">UTC+0 (GMT)</option>
                          <option value="UTC-5">UTC-5 (EST)</option>
                          <option value="UTC-8">UTC-8 (PST)</option>
                          <option value="UTC+5:30">UTC+5:30 (IST)</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button onClick={() => saveSettings('general')} disabled={saving}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Regional Settings */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <Globe className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <CardTitle className="text-foreground">Regional Settings</CardTitle>
                        <CardDescription>Localization and format preferences</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <select
                        id="language"
                        value={generalSettings.language}
                        onChange={(e) => handleGeneralChange('language', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateFormat">Date Format</Label>
                      <select
                        id="dateFormat"
                        value={generalSettings.dateFormat}
                        onChange={(e) => handleGeneralChange('dateFormat', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="numberFormat">Number Format</Label>
                      <select
                        id="numberFormat"
                        value={generalSettings.numberFormat}
                        onChange={(e) => handleGeneralChange('numberFormat', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="1,234.56">1,234.56</option>
                        <option value="1.234,56">1.234,56</option>
                        <option value="1 234.56">1 234.56</option>
                      </select>
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button onClick={() => saveSettings('general')} disabled={saving}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Notifications Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Communication Preferences */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <Mail className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <CardTitle className="text-foreground">Communication</CardTitle>
                        <CardDescription>How you want to receive notifications</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">Email Notifications</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Receive updates via email</p>
                      </div>
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">Push Notifications</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Browser push notifications</p>
                      </div>
                      <Switch
                        checked={notificationSettings.pushNotifications}
                        onCheckedChange={(checked) => handleNotificationChange('pushNotifications', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">SMS Notifications</span>
                          <Badge variant="secondary" className="text-xs">Premium</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Text message alerts</p>
                      </div>
                      <Switch
                        checked={notificationSettings.smsNotifications}
                        onCheckedChange={(checked) => handleNotificationChange('smsNotifications', checked)}
                      />
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button onClick={() => saveSettings('notifications')} disabled={saving}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Alert Types */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                        <Bell className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <CardTitle className="text-foreground">Alert Types</CardTitle>
                        <CardDescription>Choose what alerts you want to receive</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="font-medium text-foreground">Low Stock Alerts</span>
                        </div>
                        <p className="text-sm text-muted-foreground">When products are running low</p>
                      </div>
                      <Switch
                        checked={notificationSettings.lowStockAlerts}
                        onCheckedChange={(checked) => handleNotificationChange('lowStockAlerts', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="font-medium text-foreground">Sales Notifications</span>
                        </div>
                        <p className="text-sm text-muted-foreground">New sales and orders</p>
                      </div>
                      <Switch
                        checked={notificationSettings.salesNotifications}
                        onCheckedChange={(checked) => handleNotificationChange('salesNotifications', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Info className="h-4 w-4 text-blue-500" />
                          <span className="font-medium text-foreground">System Updates</span>
                        </div>
                        <p className="text-sm text-muted-foreground">App updates and maintenance</p>
                      </div>
                      <Switch
                        checked={notificationSettings.systemUpdates}
                        onCheckedChange={(checked) => handleNotificationChange('systemUpdates', checked)}
                      />
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button onClick={() => saveSettings('notifications')} disabled={saving}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Authentication */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                        <Shield className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <CardTitle className="text-foreground">Authentication</CardTitle>
                        <CardDescription>Secure your account access</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="font-medium text-foreground">Two-Factor Authentication</span>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                      </div>
                      <Switch
                        checked={securitySettings.twoFactorAuth}
                        onCheckedChange={(checked) => handleSecurityChange('twoFactorAuth', checked)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                        className="bg-background"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                      <Input
                        id="passwordExpiry"
                        type="number"
                        value={securitySettings.passwordExpiry}
                        onChange={(e) => handleSecurityChange('passwordExpiry', parseInt(e.target.value))}
                        className="bg-background"
                      />
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button onClick={() => saveSettings('security')} disabled={saving}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Session Management */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                        <Lock className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <CardTitle className="text-foreground">Session Management</CardTitle>
                        <CardDescription>Control how sessions work</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="font-medium text-foreground">Multiple Sessions</span>
                        <p className="text-sm text-muted-foreground">Allow login from multiple devices</p>
                      </div>
                      <Switch
                        checked={securitySettings.allowMultipleSessions}
                        onCheckedChange={(checked) => handleSecurityChange('allowMultipleSessions', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="font-medium text-foreground">IP Restriction</span>
                        <p className="text-sm text-muted-foreground">Restrict access to specific IPs</p>
                      </div>
                      <Switch
                        checked={securitySettings.ipRestriction}
                        onCheckedChange={(checked) => handleSecurityChange('ipRestriction', checked)}
                      />
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button onClick={() => saveSettings('security')} disabled={saving}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Display Settings */}
            <TabsContent value="display" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Theme Settings */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                        <Palette className="h-5 w-5 text-indigo-500" />
                      </div>
                      <div>
                        <CardTitle className="text-foreground">Theme & Appearance</CardTitle>
                        <CardDescription>Customize how Stockify looks</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-base font-medium mb-4 block">Theme Preference</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { key: 'light', label: 'Light', icon: Sun },
                          { key: 'dark', label: 'Dark', icon: Moon },
                          { key: 'system', label: 'System', icon: Monitor }
                        ].map(({ key, label, icon: Icon }) => (
                          <button
                            key={key}
                            onClick={() => handleDisplayChange('theme', key)}
                            className={`p-4 rounded-xl border-2 transition-all hover:border-primary/50 ${
                              displaySettings.theme === key
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:bg-accent'
                            }`}
                          >
                            <Icon className={`h-6 w-6 mx-auto mb-2 ${
                              displaySettings.theme === key ? 'text-primary' : 'text-muted-foreground'
                            }`} />
                            <div className="text-sm font-medium">{label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="font-medium text-foreground">Compact Mode</span>
                        <p className="text-sm text-muted-foreground">Reduce spacing and padding</p>
                      </div>
                      <Switch
                        checked={displaySettings.compactMode}
                        onCheckedChange={(checked) => handleDisplayChange('compactMode', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="font-medium text-foreground">Animations</span>
                        <p className="text-sm text-muted-foreground">Enable smooth transitions</p>
                      </div>
                      <Switch
                        checked={displaySettings.showAnimations}
                        onCheckedChange={(checked) => handleDisplayChange('showAnimations', checked)}
                      />
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button onClick={() => saveSettings('display')} disabled={saving}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Accessibility */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <Eye className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <CardTitle className="text-foreground">Accessibility</CardTitle>
                        <CardDescription>Make Stockify easier to use</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="fontSize">Font Size</Label>
                      <select
                        id="fontSize"
                        value={displaySettings.fontSize}
                        onChange={(e) => handleDisplayChange('fontSize', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                        <option value="extra-large">Extra Large</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="font-medium text-foreground">High Contrast</span>
                        <p className="text-sm text-muted-foreground">Increase color contrast</p>
                      </div>
                      <Switch
                        checked={displaySettings.highContrast}
                        onCheckedChange={(checked) => handleDisplayChange('highContrast', checked)}
                      />
                    </div>
                    
                    <div className="flex justify-end pt-4">
                      <Button onClick={() => saveSettings('display')} disabled={saving}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Print Settings */}
            <TabsContent value="print" className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                      <Printer className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <CardTitle className="text-foreground">Print Settings</CardTitle>
                      <CardDescription>Configure your receipt and label printing preferences</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="defaultPrinter">Default Printer</Label>
                      <Input
                        id="defaultPrinter"
                        value={printSettings.defaultPrinter}
                        onChange={(e) => handlePrintChange('defaultPrinter', e.target.value)}
                        placeholder="Enter printer name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="receiptSize">Receipt Size</Label>
                      <select
                        id="receiptSize"
                        value={printSettings.receiptSize}
                        onChange={(e) => handlePrintChange('receiptSize', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md"
                      >
                        <option value="58mm">58mm (Thermal)</option>
                        <option value="80mm">80mm (Standard)</option>
                        <option value="A4">A4 (Laser/Inkjet)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="copies">Number of Copies</Label>
                      <Input
                        id="copies"
                        type="number"
                        min="1"
                        max="5"
                        value={printSettings.copies}
                        onChange={(e) => handlePrintChange('copies', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="font-medium text-foreground">Show Logo</span>
                        <p className="text-sm text-muted-foreground">Display company logo on receipts</p>
                      </div>
                      <Switch
                        checked={printSettings.showLogo}
                        onCheckedChange={(checked) => handlePrintChange('showLogo', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="font-medium text-foreground">Show Tax Details</span>
                        <p className="text-sm text-muted-foreground">Display tax breakdown on receipts</p>
                      </div>
                      <Switch
                        checked={printSettings.showTaxDetails}
                        onCheckedChange={(checked) => handlePrintChange('showTaxDetails', checked)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="headerText">Receipt Header</Label>
                    <Input
                      id="headerText"
                      value={printSettings.headerText}
                      onChange={(e) => handlePrintChange('headerText', e.target.value)}
                      placeholder="Thank you for shopping!"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="footerText">Receipt Footer</Label>
                    <Input
                      id="footerText"
                      value={printSettings.footerText}
                      onChange={(e) => handlePrintChange('footerText', e.target.value)}
                      placeholder="Visit us again!"
                    />
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button onClick={() => saveSettings('print')} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Print Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Invoice Settings */}
            <TabsContent value="invoice" className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <CardTitle className="text-foreground">Invoice Settings</CardTitle>
                      <CardDescription>Configure your invoice numbering and terms</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prefix">Invoice Prefix</Label>
                      <Input
                        id="prefix"
                        value={invoiceSettings.prefix}
                        onChange={(e) => handleInvoiceChange('prefix', e.target.value)}
                        placeholder="INV"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startingNumber">Starting Number</Label>
                      <Input
                        id="startingNumber"
                        type="number"
                        value={invoiceSettings.startingNumber}
                        onChange={(e) => handleInvoiceChange('startingNumber', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="terms">Payment Terms</Label>
                    <Input
                      id="terms"
                      value={invoiceSettings.terms}
                      onChange={(e) => handleInvoiceChange('terms', e.target.value)}
                      placeholder="Payment due within 15 days"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Default Notes</Label>
                    <textarea
                      id="notes"
                      value={invoiceSettings.notes}
                      onChange={(e) => handleInvoiceChange('notes', e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md"
                      rows={3}
                      placeholder="Additional notes for customers..."
                    />
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button onClick={() => saveSettings('invoice')} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Invoice Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Settings */}
            <TabsContent value="advanced" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Data Management */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <Database className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <CardTitle className="text-foreground">Data Management</CardTitle>
                        <CardDescription>Import, export, and manage your data</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full justify-start" onClick={() => apiService.exportProductsToCSV()}>
                      <Download className="h-4 w-4 mr-2" />
                      Export All Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => document.getElementById('csv-import')?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Import Data
                    </Button>
                    <input id="csv-import" type="file" accept=".csv" className="hidden" />
                    <Button variant="outline" className="w-full justify-start">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Backup Database
                    </Button>
                    <Separator />
                    <Button variant="destructive" className="w-full justify-start" onClick={() => resetSettings()}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Reset All Settings
                    </Button>
                  </CardContent>
                </Card>

                {/* System Information */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-500/10 rounded-lg flex items-center justify-center">
                        <Info className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <CardTitle className="text-foreground">System Information</CardTitle>
                        <CardDescription>Application and system details</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Version</p>
                        <p className="font-medium text-foreground">v2.1.0</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Build</p>
                        <p className="font-medium text-foreground">20241005</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Environment</p>
                        <p className="font-medium text-foreground">Production</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Server</p>
                        <p className="font-medium text-foreground">Healthy</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-medium text-foreground">Storage Usage</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Used</span>
                          <span className="text-foreground">2.3 GB of 10 GB</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: '23%' }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </InventoryLayout>
  );
}