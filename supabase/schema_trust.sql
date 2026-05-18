-- Speakeasy India — Trust Infrastructure (Prompt 7)
-- Backward-safe: only adds new site_settings keys; preserves existing.
-- Run in Supabase SQL editor. Safe to re-run.

-- site_settings table already exists from schema.sql; this only inserts defaults.
insert into public.site_settings (key, value) values
  ('about_mission_en', '"Speakeasy India exists to make accurate, judgement-free sexual wellness education accessible to every Indian — in plain language, without shame, without stigma."'),
  ('about_mission_hi', '"Speakeasy India का उद्देश्य है — हर भारतीय तक सटीक, बिना निर्णय की यौन कल्याण शिक्षा पहुँचाना — सरल भाषा में, बिना शर्म, बिना कलंक।"'),
  ('founder_note_en', '"I built Speakeasy because too many of us grew up without honest answers. This is the resource I wish my younger self had — calm, accurate, and culturally aware."'),
  ('founder_note_hi', '"मैंने Speakeasy इसलिए बनाया क्योंकि हममें से बहुतों को कभी ईमानदार जवाब नहीं मिले। यह वही संसाधन है जो मैं अपने छोटे रूप को देना चाहता था — शांत, सटीक और सांस्कृतिक रूप से जागरूक।"'),
  ('what_we_are_not_en', '["Not pornography or adult entertainment", "Not a dating or hookup platform", "Not a medical diagnosis service", "Not a crisis or emergency response system", "Not a place for shame, judgement, or misinformation"]'::jsonb),
  ('what_we_are_not_hi', '["अश्लील सामग्री या मनोरंजन नहीं", "डेटिंग या हुकअप मंच नहीं", "चिकित्सीय निदान सेवा नहीं", "संकट या आपातकालीन प्रतिक्रिया प्रणाली नहीं", "शर्म, निर्णय या भ्रामक जानकारी का स्थान नहीं"]'::jsonb),
  ('privacy_intro_en', '"We built Speakeasy with privacy in mind. We ask for as little information as possible and never sell your data."'),
  ('privacy_intro_hi', '"हमने Speakeasy को गोपनीयता को ध्यान में रखकर बनाया है। हम बहुत कम जानकारी माँगते हैं और आपका डेटा कभी नहीं बेचते।"'),
  ('privacy_data_use_en', '"Anonymous questions are reviewed by editors and clinicians before publishing. Basic analytics (page views, anonymous device info) help us improve the platform. Email — if shared — is only used to respond to you."'),
  ('privacy_data_use_hi', '"गुमनाम प्रश्नों की समीक्षा संपादक और चिकित्सक प्रकाशन से पहले करते हैं। बुनियादी विश्लेषण (पेज व्यू, गुमनाम डिवाइस जानकारी) हमें मंच सुधारने में मदद करते हैं। यदि आप ईमेल साझा करते हैं, तो वह केवल आपको उत्तर देने के लिए उपयोग होता है।"'),
  ('privacy_never_collect_en', '["Your real name (unless you choose to share it)", "Government IDs or Aadhaar", "Sexual history or identifying personal stories", "Contact lists or photos from your device", "Location beyond country/region for analytics"]'::jsonb),
  ('privacy_never_collect_hi', '["आपका असली नाम (जब तक आप स्वयं न दें)", "सरकारी पहचान पत्र या आधार", "यौन इतिहास या पहचान योग्य व्यक्तिगत कहानियाँ", "आपके डिवाइस से संपर्क सूची या तस्वीरें", "विश्लेषण के लिए देश/क्षेत्र से अधिक स्थान जानकारी"]'::jsonb),
  ('disclaimer_en', '"Speakeasy India provides educational information only. Our content is reviewed by qualified clinicians but is not a substitute for personal medical advice, diagnosis, or treatment. Always consult a licensed healthcare provider for your specific situation. If you are in crisis, please contact one of the helplines listed on our Resources page."'),
  ('disclaimer_hi', '"Speakeasy India केवल शैक्षिक जानकारी प्रदान करता है। हमारी सामग्री योग्य चिकित्सकों द्वारा समीक्षित है, लेकिन यह व्यक्तिगत चिकित्सीय सलाह, निदान या उपचार का विकल्प नहीं है। अपनी विशिष्ट स्थिति के लिए हमेशा लाइसेंस प्राप्त स्वास्थ्य सेवा प्रदाता से परामर्श करें। यदि आप संकट में हैं, तो कृपया हमारे संसाधन पृष्ठ पर सूचीबद्ध हेल्पलाइनों से संपर्क करें।"'),
  ('crisis_icall', '{"name":"iCall","name_hi":"iCall","phone":"9152987821","hours":"Mon–Sat, 8 AM – 10 PM","hours_hi":"सोम–शनि, सुबह 8 – रात 10","desc":"Free, confidential mental health support","desc_hi":"मुफ़्त, गोपनीय मानसिक स्वास्थ्य सहायता"}'::jsonb),
  ('crisis_vandrevala', '{"name":"Vandrevala Foundation","name_hi":"वंद्रेवाला फाउंडेशन","phone":"18602662345","hours":"24/7","hours_hi":"24/7","desc":"Free mental health helpline","desc_hi":"मुफ़्त मानसिक स्वास्थ्य हेल्पलाइन"}'::jsonb),
  ('crisis_pcvc', '{"name":"PCVC (Chennai)","name_hi":"PCVC (चेन्नई)","phone":"04443111143","hours":"24/7","hours_hi":"24/7","desc":"Support for survivors of violence","desc_hi":"हिंसा से पीड़ितों के लिए सहायता"}'::jsonb),
  ('crisis_ncw', '{"name":"NCW Helpline","name_hi":"NCW हेल्पलाइन","phone":"7827170170","hours":"24/7","hours_hi":"24/7","desc":"National Commission for Women","desc_hi":"राष्ट्रीय महिला आयोग"}'::jsonb),
  ('crisis_childline', '{"name":"Childline India","name_hi":"चाइल्डलाइन इंडिया","phone":"1098","hours":"24/7","hours_hi":"24/7","desc":"Children in distress","desc_hi":"संकट में बच्चे"}'::jsonb),
  ('resource_lgbtq', '[{"name":"The Humsafar Trust","url":"https://humsafar.org","desc":"LGBTQ+ health and rights"},{"name":"Nazariya","url":"https://nazariyaqfrg.wordpress.com","desc":"Queer feminist resource group"}]'::jsonb),
  ('resource_reproductive_health', '[{"name":"Family Planning Association of India","url":"https://www.fpaindia.org","desc":"Sexual & reproductive health services"},{"name":"YP Foundation","url":"https://www.theypfoundation.org","desc":"Youth-led SRHR programs"}]'::jsonb),
  ('contact_general_email', '"hello@speakeasyindia.org"'),
  ('contact_press_email', '"press@speakeasyindia.org"'),
  ('contact_expert_email', '"experts@speakeasyindia.org"'),
  ('contact_privacy_email', '"privacy@speakeasyindia.org"')
on conflict (key) do nothing;