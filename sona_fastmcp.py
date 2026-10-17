"""
Sona AI - Enterprise Agri-Fintech FastMCP Server
Exposes dosage calculations, live weather checks, climate loss prevention,
and automated order fulfillment as Model Context Protocol (MCP) Tools for fastn.
"""

from fastmcp import FastMCP
import requests

# 1. Initialize FastMCP Server
mcp = FastMCP("Sona-Agri-FastMCP-Server")

BACKEND_URL = "http://localhost:5000"

# ==============================================================================
# TOOL 1: Autonomous Climate-Smart Farm Operations & Loss Prevention Engine
# ==============================================================================
@mcp.tool()
def generate_climate_smart_schedule(location: str = "Khanewal", crop: str = "گندم (Wheat)", acres: float = 10.0) -> dict:
    """
    Autonomously evaluates 7-day live meteorological data for any global location,
    determines the optimal crop harvesting window, issues pesticide spray drift alerts,
    and calculates financial/nitrogen runoff prevented.
    """
    try:
        res = requests.post(
            f"{BACKEND_URL}/api/smart-plan",
            json={"location": location, "crop": crop, "acres": acres},
            timeout=8
        )
        data = res.json()
        if data.get("success"):
            return {
                "status": "SUCCESS",
                "location": data.get("location"),
                "country": data.get("country"),
                "harvest_window": data.get("plan", {}).get("harvestWindow"),
                "spray_safety": data.get("plan", {}).get("spraySafety"),
                "financial_loss_prevented_pkr": data.get("plan", {}).get("lossPrevention", {}).get("pkrSaved"),
                "financial_loss_prevented_usd": data.get("plan", {}).get("lossPrevention", {}).get("usdSaved"),
                "nitrogen_runoff_prevented_kg": data.get("plan", {}).get("lossPrevention", {}).get("nitrogenRunoffPreventedKg"),
                "advisory_urdu": data.get("urduText")
            }
        return {"status": "FAILED", "error": "Unable to generate smart plan."}
    except Exception as e:
        return {"status": "ERROR", "error": str(e)}


# ==============================================================================
# TOOL 2: Scientific Fertilizer Dosage Calculator
# ==============================================================================
@mcp.tool()
def calculate_fertilizer_dosage(crop: str, acres: float) -> dict:
    """
    Calculates exact bag requirements of Sona Urea, CAN Gowara, and Nitrophos 
    based on crop type and land acreage.
    """
    try:
        res = requests.post(
            f"{BACKEND_URL}/api/calculator",
            json={"crop": crop.lower(), "acres": acres},
            timeout=5
        )
        data = res.json()
        return {
            "crop": data.get("cropUrdu", crop),
            "acres": acres,
            "sarsabz_can_bags": data.get("sarsabzCan"),
            "sarsabz_nitrophos_bags": data.get("sarsabzNp"),
            "sarsabz_urea_bags": data.get("sarsabzUrea"),
            "sarsabz_zinc_packs": data.get("sarsabzZinc"),
            "application_schedule": data.get("schedule")
        }
    except Exception as e:
        return {"error": f"Failed to compute dosage: {str(e)}"}


# ==============================================================================
# TOOL 3: Automated Order Dispatch & FasalPay BNPL Booking
# ==============================================================================
@mcp.tool()
def book_fertilizer_order(
    farmer_name: str,
    phone: str,
    district: str,
    items: str,
    total_amount: int,
    payment_method: str = "فصل پے زرعی قرضہ (FasalPay BNPL)"
) -> dict:
    """
    Dispatches a confirmed fertilizer order into Supabase, generates an invoice, 
    and notifies the nearest district dealer branch.
    """
    try:
        res = requests.post(
            f"{BACKEND_URL}/api/orders/create",
            json={
                "farmerName": farmer_name,
                "phone": phone,
                "district": district,
                "crop": "گندم (Wheat)",
                "items": items,
                "totalAmount": total_amount,
                "paymentMethod": payment_method
            },
            timeout=5
        )
        data = res.json()
        if data.get("success"):
            order = data["order"]
            return {
                "status": "CONFIRMED",
                "order_id": order.get("order_id"),
                "farmer": order.get("farmer_name"),
                "phone": order.get("phone"),
                "items": order.get("items"),
                "total_amount_pkr": order.get("total_amount"),
                "payment_mode": order.get("payment_method"),
                "dealer_status": f"Order dispatched to official Fatima/Sona dealer in {district}."
            }
        return {"status": "FAILED", "error": data.get("error")}
    except Exception as e:
        return {"status": "ERROR", "error": str(e)}


# ==============================================================================
# TOOL 4: Real-time Order Ledger & Tracking
# ==============================================================================
@mcp.tool()
def get_dealer_orders_ledger() -> dict:
    """
    Retrieves real-time pending and confirmed orders from the dealer cloud database.
    """
    try:
        res = requests.get(f"{BACKEND_URL}/api/orders", timeout=5)
        data = res.json()
        return {
            "total_orders": data.get("count", 0),
            "orders": data.get("orders", [])[:5]
        }
    except Exception as e:
        return {"error": str(e)}


# ==============================================================================
# TOOL 5: Multi-Agent Consensus & Debate Council (CIO Recommendation)
# ==============================================================================
@mcp.tool()
def multi_agent_council_debate(location: str = "Khanewal", crop: str = "Wheat", acres: float = 10.0, force_anomaly: bool = False) -> dict:
    """
    Simulates a multi-agent debate between Agronomist (Dr. Tariq), Meteorological Sentinel,
    and Fintech Economist to reach a unanimous crop advisory consensus.
    """
    try:
        res = requests.post(
            f"{BACKEND_URL}/api/council-debate",
            json={"location": location, "crop": crop, "acres": acres, "forceAnomaly": force_anomaly},
            timeout=8
        )
        data = res.json()
        if data.get("success"):
            return {
                "location": data.get("location"),
                "consensus_verdict": data.get("consensusVerdict"),
                "agronomist_vote": data.get("agronomist", {}).get("stance"),
                "weather_vote": data.get("weather", {}).get("stance"),
                "economist_vote": data.get("economist", {}).get("stance"),
                "debate_transcript": data.get("debateTranscript")
            }
        return {"status": "FAILED", "error": "Unable to execute council debate."}
    except Exception as e:
        return {"status": "ERROR", "error": str(e)}


# ==============================================================================
# TOOL 6: IBM Watson Electronic Field Record (EFR) Digital Twin
# ==============================================================================
@mcp.tool()
def get_electronic_field_record(district: str = "Khanewal") -> dict:
    """
    Retrieves the IBM Watson-style Electronic Field Record (EFR) digital twin 
    including soil profile, nutrient deficits, and FasalPay credit profile.
    """
    try:
        res = requests.get(f"{BACKEND_URL}/api/efr/{district.lower()}", timeout=5)
        return res.json().get("efr", {})
    except Exception as e:
        return {"error": str(e)}


# ==============================================================================
# TOOL 7: Multimodal Crop Doctor & Edge Leaf Vision Diagnosis
# ==============================================================================
@mcp.tool()
def diagnose_crop_disease(preset_id: str = "wheat_yellow_rust", crop: str = "Wheat") -> dict:
    """
    Diagnoses crop leaf pathology, specifies pathogen etiology, and prescribes 
    the exact Fatima chemical/biological remedy in Urdu and English.
    """
    try:
        res = requests.post(
            f"{BACKEND_URL}/api/crop-doctor/diagnose",
            json={"presetId": preset_id, "crop": crop},
            timeout=6
        )
        return res.json().get("diagnosis", {})
    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    mcp.run()
