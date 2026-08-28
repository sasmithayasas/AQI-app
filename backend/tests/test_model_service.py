import unittest
import sys
import os

# Add backend directory to sys.path so we can import services
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.model_service import pm25_to_aqi, aqi_category

class TestModelService(unittest.TestCase):
    
    def test_pm25_to_aqi_good(self):
        """Test PM2.5 to AQI conversion for 'Good' tier (0-12.0)"""
        self.assertEqual(pm25_to_aqi(0.0), 0)
        self.assertEqual(pm25_to_aqi(10.0), 42)
        self.assertEqual(pm25_to_aqi(12.0), 50)
        
    def test_pm25_to_aqi_moderate(self):
        """Test PM2.5 to AQI conversion for 'Moderate' tier (12.1-35.4)"""
        self.assertEqual(pm25_to_aqi(15.0), 57)
        self.assertEqual(pm25_to_aqi(30.0), 89)
        self.assertEqual(pm25_to_aqi(35.4), 100)
        
    def test_pm25_to_aqi_unhealthy_sensitive(self):
        """Test PM2.5 to AQI conversion for 'Unhealthy for Sensitive Groups' tier (35.5-55.4)"""
        self.assertEqual(pm25_to_aqi(40.0), 112)
        self.assertEqual(pm25_to_aqi(55.4), 150)
        
    def test_pm25_to_aqi_unhealthy(self):
        """Test PM2.5 to AQI conversion for 'Unhealthy' tier (55.5-150.4)"""
        self.assertEqual(pm25_to_aqi(65.0), 156)
        self.assertEqual(pm25_to_aqi(150.4), 200)
        
    def test_pm25_to_aqi_extreme(self):
        """Test PM2.5 to AQI conversion for extreme hazardous tiers"""
        self.assertEqual(pm25_to_aqi(350.0), 400)
        self.assertEqual(pm25_to_aqi(550.0), 500) # Capped at 500 theoretically, though function might extrapolate
        
    def test_aqi_category(self):
        """Test that AQI integers map to the correct US-EPA health string"""
        self.assertEqual(aqi_category(25), "Good")
        self.assertEqual(aqi_category(50), "Good")
        self.assertEqual(aqi_category(51), "Moderate")
        self.assertEqual(aqi_category(100), "Moderate")
        self.assertEqual(aqi_category(101), "Unhealthy for Sensitive Groups")
        self.assertEqual(aqi_category(150), "Unhealthy for Sensitive Groups")
        self.assertEqual(aqi_category(151), "Unhealthy")
        self.assertEqual(aqi_category(200), "Unhealthy")
        self.assertEqual(aqi_category(201), "Very Unhealthy")
        self.assertEqual(aqi_category(300), "Very Unhealthy")
        self.assertEqual(aqi_category(301), "Hazardous")
        self.assertEqual(aqi_category(500), "Hazardous")

if __name__ == '__main__':
    unittest.main()
