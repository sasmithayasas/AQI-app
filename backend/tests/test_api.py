import unittest
import sys
import os
from fastapi.testclient import TestClient

# Add backend directory to sys.path so we can import main
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app

class TestAPIEndpoints(unittest.TestCase):
    
    def setUp(self):
        self.client = TestClient(app)
        
    def test_health_check(self):
        """Test the /api/health endpoint to ensure API is responsive"""
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertIn("models_loaded", data)
        self.assertTrue(data["models_loaded"])
        
    def test_forecast_default_city(self):
        """Test that calling forecast without a city parameter defaults to Kandy and returns 200"""
        response = self.client.get("/api/forecast")
        self.assertEqual(response.status_code, 200)
        self.assertIn("id", response.json())
        self.assertEqual(response.json()["id"].lower(), "kandy")
        
    def test_forecast_invalid_city(self):
        """Test that calling forecast with an unsupported city returns an explicit error JSON"""
        response = self.client.get("/api/forecast?city=galle")
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("error", data)
        self.assertTrue("not supported" in data["error"])

if __name__ == '__main__':
    unittest.main()
