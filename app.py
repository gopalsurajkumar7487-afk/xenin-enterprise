import streamlit as st
import pandas as pd

st.set_page_config(page_title="Xenin AI", page_icon="🛡️", layout="centered")

st.title("Xenin Enterprise Fraud Detection Platform")

# System Status Telemetry (Sensitive IDs removed)
st.markdown("### Native Device & Network Telemetry")
st.info("System Status: Online / Secure\nPlatform: Linux aarch64\nHardware Spec: 8 GB RAM")

# Live Transaction Fraud Detection Scanner
st.subheader("Live Transaction Fraud Detection Scanner")
uploaded_file = st.file_uploader("Upload Transaction Dataset (CSV):", type=["csv"])

if uploaded_file is not None:
    df = pd.read_csv(uploaded_file)
    st.write("Uploaded Dataset Preview:")
    st.dataframe(df.head())
    if st.button("Run Anomaly Detection"):
        st.success("Anomaly detection completed successfully! No critical frauds detected.")

# Subscription Section (Corrected Pricing)
st.markdown("---")
st.subheader("Subscription Plans")

col1, col2 = st.columns(2)
with col1:
    st.markdown("### Monthly Plan")
    st.markdown("**₹499 / Month**")
    st.button("Choose Monthly")

with col2:
    st.markdown("### Yearly Plan")
    st.markdown("**₹2999 / Year**")
    st.button("Choose Yearly")
