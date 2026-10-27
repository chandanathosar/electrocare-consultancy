import { ServiceDetail } from '../types';

export const SERVICES_LIST: ServiceDetail[] = [
  {
    id: 'electricity_bill_reduction',
    title: 'Electricity Bill Reduction Consultation',
    tagline: 'Slash recurring energy expenses by 20% to 45% without compromising operational power.',
    shortDesc: 'Comprehensive tariff structure restructuring, peak-demand shaving, power factor optimization, and elimination of phantom vampire loads across circuits.',
    iconName: 'Zap',
    targetSavings: '20% - 45% Monthly',
    turnaroundTime: '2 - 3 Days',
    badgeColor: 'from-blue-600 to-indigo-600',
    idealFor: 'High-consumption households, IT offices, commercial stores & light industrial facilities',
    features: [
      'Time-of-Use (TOU) & Peak Tariff Restructuring',
      'Power Factor Correction (kVA vs kW penalty elimination)',
      'Standby & Vampire Power Circuit Isolation',
      'Load Redistribution across 3-Phase Panels',
      'Off-Peak Scheduling Automation Advice'
    ],
    deliverables: [
      'Comprehensive 12-Month Utility Tariff Assessment',
      'Actionable Quick-Win Reduction Roadmap (Zero-Cost changes)',
      'Hardware Retrofit Financial Payback Schedule',
      'Post-implementation verification metric'
    ]
  },
  {
    id: 'energy_efficiency',
    title: 'Energy Efficiency Advice & Strategies',
    tagline: 'Transform how your facility or home consumes kilowatt-hours through smart engineering.',
    shortDesc: 'Scientific analysis of your thermodynamic losses, HVAC efficiency curves, smart lighting lux levels, and architectural power distribution.',
    iconName: 'TrendingDown',
    targetSavings: '15% - 35% kWh Drop',
    turnaroundTime: '3 - 5 Days',
    badgeColor: 'from-indigo-600 to-purple-600',
    idealFor: 'Apartment complexes, corporate spaces, universities & health clinics',
    features: [
      'HVAC & Heat Pump Cycle Optimization',
      'Daylight Harvesting & Sensor Automation Strategy',
      'Electronic Inverter Motor Matching',
      'Building Thermal Envelope Power Loss Analysis',
      'Smart Thermostat & Micro-Zone Scheduling'
    ],
    deliverables: [
      'Granular kWh Consumption Heatmap',
      'Behavioral & Mechanical Optimization Directives',
      'Targeted Efficiency Milestone Blueprint',
      'Quarterly Follow-up Review Checklists'
    ]
  },
  {
    id: 'electronic_appliances',
    title: 'Electronic Appliance Consultation',
    tagline: 'Maximized lifespan, reduced thermal strain, and smart rating upgrades for high-drain electronics.',
    shortDesc: 'Diagnostic health inspection of heavy-draw electronic devices, motor ratings, harmonic distortion risks, and tailored buying advisory for high-efficiency upgrades.',
    iconName: 'Cpu',
    targetSavings: 'Up to $1,800/yr Saved',
    turnaroundTime: '1 - 2 Days',
    badgeColor: 'from-purple-600 to-pink-600',
    idealFor: 'Residential homeowners, modern smart homes, commercial kitchens & server rooms',
    features: [
      'Harmonics & Voltage Fluctuation Tolerance Check',
      'Inverter vs Non-Inverter Lifecycle Cost Comparisons',
      'Appliance Load Profiling (Refrigeration, AC, Compressors, Servers)',
      'Preventive Electronic Wear-and-Tear Diagnostics',
      'Star Rating ROI Benchmarking for New Purchases'
    ],
    deliverables: [
      'Appliance Health & Remaining Useful Life Scorecard',
      'Pre-Purchase Appliance Buyer Guide with Exact Model Recommendations',
      'Surge & Voltage Protection Layout Recommendations',
      'Proper Grounding & Earthing Verification'
    ]
  },
  {
    id: 'energy_audit',
    title: 'Energy Audit Guidance & Inspection',
    tagline: 'Professional Level 1 & Level 2 Energy Audits using state-of-the-art power analyzers.',
    shortDesc: 'End-to-end guidance through electrical auditing protocols, thermal infrared imaging for hot spots, load balancing, and regulatory compliance.',
    iconName: 'SearchCheck',
    targetSavings: '25% - 50% Waste Elimination',
    turnaroundTime: '3 - 7 Days',
    badgeColor: 'from-blue-700 to-cyan-600',
    idealFor: 'Enterprises, factories, medical centers, commercial real estate & high-end villas',
    features: [
      'FLIR Thermal Infrared Hotspot & Loose Connection Detection',
      'Fluke 3-Phase Power Quality & Harmonic Logging',
      'Transformer & Distribution Sub-Panel Health Scans',
      'Leakage Current & Ground Resistance Verification',
      'ISO 50001 & Local Energy Code Compliance Alignment'
    ],
    deliverables: [
      'Official Certified Audit Report with Thermal Imagery',
      'Electrical Hazard & Fire Risk Mitigation Actions',
      'Prioritized Energy Conservation Measures (ECMs)',
      'Executive Summary Presentation for Stakeholders'
    ]
  },
  {
    id: 'product_recommendation',
    title: 'Energy-Saving Product Recommendations',
    tagline: 'Hand-picked, vetted industrial and residential hardware that pays for itself in months.',
    shortDesc: 'Independent, unbiased curation of smart variable frequency drives (VFDs), smart circuit breakers, IoT energy monitors, and intelligent power controllers.',
    iconName: 'ShieldCheck',
    targetSavings: 'Fast 4-12 Mo Payback',
    turnaroundTime: 'Instant / 1 Day',
    badgeColor: 'from-violet-600 to-blue-600',
    idealFor: 'Home automation enthusiasts, facility engineers & green-minded businesses',
    features: [
      'VFD (Variable Speed Drive) Sizing for Motors & Pumps',
      'Real-Time IoT Whole-Home/Building Energy Monitors',
      'Smart Relay Micro-controllers & Automated Contactor Panels',
      'High-Efficiency Hybrid Solar Inverter Sizing',
      'Automated Zero-Leakage Power Strips & Shunts'
    ],
    deliverables: [
      'Engineered Hardware Bill of Materials (BOM)',
      'Verified Vendor & Distributor Discount Codes',
      'Plug-and-Play Installation Diagrams & Wiring Guide',
      'Lifetime Energy Savings vs Capex Calculator'
    ]
  }
];

export const ENERGY_SOLUTIONS_FAQS = [
  {
    question: 'How fast can I see a noticeable drop in my electricity bill?',
    answer: 'Most clients notice a 15% to 25% reduction on their very first billing cycle after implementing our initial zero-cost behavioral and load-scheduling recommendations. Hardware upgrades (such as smart VFDs or inverter retrofits) typically yield 30% to 45% reductions within 30 to 60 days.'
  },
  {
    question: 'What is the difference between a simple electrician visit and an ElectroCare Consultation?',
    answer: 'An electrician repairs faulty wiring or installs outlets, but rarely analyzes power factor, harmonic distortion, thermal dissipation, tariff schedules, or thermodynamic efficiency. ElectroCare consultants are certified energy engineers equipped with industrial-grade 3-phase logging analyzers and thermal cameras to identify invisible energy leaks and optimize your electrical ROI.'
  },
  {
    question: 'Do you sell appliances or do you provide unbiased recommendations?',
    answer: 'We are an independent consultancy. We do not manufacture appliances, which ensures our recommendations are 100% unbiased and mathematically focused solely on your energy savings, reliability, and fastest payback.'
  },
  {
    question: 'What information do I need to provide for an initial consultation?',
    answer: 'Having your latest 2 to 3 electricity utility bills, an approximate list of heavy electronic equipment (HVAC units, pumps, commercial appliances, servers), and your property size is sufficient. Our team handles the rest.'
  },
  {
    question: 'Is my enquiry and personal data safe with ElectroCare?',
    answer: 'Yes, absolutely. We validate and encrypt customer inquiries permanently in our secure database with role-based admin access control. Your contact details are never shared or sold to third-party telemarketers.'
  }
];

export const CLIENT_TESTIMONIALS = [
  {
    name: 'Robert Hastings',
    role: 'Operations Director',
    company: 'Apex Logistics & Cold Chain',
    avatar: 'RH',
    rating: 5,
    saving: '$14,200 Annual Savings',
    comment: 'ElectroCare conducted a 3-phase harmonic and thermal audit on our 4 cold-storage compressors. By tuning our peak power factor and adding intelligent VFDs, our monthly power bill plummeted by 34%.'
  },
  {
    name: 'Elena Rostova',
    role: 'Property Manager',
    company: 'Skyline Residences (180 Units)',
    avatar: 'ER',
    rating: 5,
    saving: '28% Common Area Power Cut',
    comment: 'The team identified severe vampire standby leakage in our elevator motor banks and pumping stations. Their action plan paid for itself in less than 3 months. Outstanding professionalism.'
  },
  {
    name: 'Julian Chen',
    role: 'Homeowner & Tech Consultant',
    company: 'Residential Smart Villa',
    avatar: 'JC',
    rating: 5,
    saving: '$285/Month Saved',
    comment: 'I was puzzled why my electric bill was so high despite buying new appliances. ElectroCare found improper grounding and improper HVAC inverter sizing. They saved me thousands over the equipment lifespan.'
  }
];
