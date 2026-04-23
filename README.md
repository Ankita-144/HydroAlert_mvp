# HydroAlert

HydroAlert is a web-based system for continuous water quality monitoring using AI-assisted analysis of chemical test strips. It is designed to detect early signs of contamination and prevent large-scale water safety failures in institutional environments such as campuses.

## Problem Statement

Water quality in campuses is typically checked reactively, only after visible issues or health incidents occur. This delay leads to high financial costs, health risks, and reputational damage.

HydroAlert addresses this gap by enabling daily, outlet-level monitoring instead of infrequent manual testing.

## Solution Overview

HydroAlert combines low-cost chemical testing with AI-based analysis to generate actionable insights:

* Chemical test strips capture parameters such as chlorine, pH, and hardness
* Image-based analysis is performed using Gemini-based vision models
* Results are converted into clear safety classifications and alerts
* A centralized dashboard provides real-time monitoring and historical tracking

## Key Detection Logic

The system focuses on indicators that correlate strongly with contamination risk:

* Low residual chlorine
  Indicates possible disinfection failure

* Abnormal pH levels
  Chlorine effectiveness drops outside the (0.5-1)ppm for drinking water range

* Sudden chemical drops
  May indicate sewage intrusion or presence of organic pathogens

These signals allow early detection before microbial outbreaks occur.

## Features

* Daily monitoring of water sources at outlet level
* AI-based interpretation of test strip data
* Real-time dashboard with safety classification (Safe / Borderline / Unsafe)
* Alert system for contamination risks
* Historical logs for accountability and audits

## Impact

* Shifts water safety from reactive to preventive
* Reduces emergency response costs significantly
* Provides transparency to users and accountability to institutions
* Enables data-driven decision making for maintenance and safety

## Accuracy

The current prototype achieves approximately 85% accuracy in interpreting chemical strip data under controlled conditions.

## Tech Stack

* Frontend: React (Vite)
* Styling: Tailwind CSS
* Backend / Database: Supabase
* AI Component: Gemini-based image analysis

## Project Status

This project is a working MVP (Minimum Viable Prototype) demonstrating the feasibility of AI-assisted water monitoring.

It was selected for presentation at IIT Delhi (BEcon 2026).

## How to Run
https://hydroalert-mvp.lovable.app

## Future Work

* Improve model accuracy across varying lighting conditions
* Automate calibration of strip color interpretation
* Integrate IoT-based real-time sensing
* Expand deployment to larger institutional networks

## Authors

Ankita Kumari
Koppeti Pushkar
Vivek Kumar Khandelwal
