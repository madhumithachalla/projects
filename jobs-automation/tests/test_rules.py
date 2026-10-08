import os
import sys
import unittest
from datetime import date

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from jobsys.profile import load_profile
from jobsys.rules import classify, years_required

P = load_profile()
TODAY = date(2026, 10, 8)


def run(title, text, company="X", **kw):
    return classify({"company": company, "title": title, "text": text, **kw}, P, today=TODAY)


class SkipRules(unittest.TestCase):
    def test_citizen_or_pr_dxc(self):
        v = run("2027 DXC Technology Graduate Program", "You should be: An Australian citizen or Australian Permanant Resident. IT technology graduate.")
        self.assertEqual(v.decision, "SKIP"); self.assertIn("Citizenship or PR required", v.reasons)

    def test_citizen_scyne_with_boilerplate_far_away(self):
        txt = "Be an Australian citizen or permanent resident. IT technology role. " + "x " * 400 + "equal opportunity employer discrimination"
        self.assertEqual(run("Technology Graduate IT", txt).decision, "SKIP")

    def test_inclusive_citizen_sentence_is_not_a_restriction_eastlink(self):
        txt = "you must be an Australian citizen, an Australian permanent resident, a citizen of New Zealand or a non-Australian citizen holding a valid visa with work entitlements. IT support desktop."
        self.assertNotIn("Citizenship or PR required", run("IT Support Analyst", txt).reasons)

    def test_right_to_work_wording_is_fine_bega(self):
        v = run("IT Support Analyst", "We will accept applications from all people with the right to live and work in Australia. IT support desktop service desk.")
        self.assertNotIn("Citizenship or PR required", v.reasons)

    def test_non_discrimination_boilerplate_is_fine_iress(self):
        v = run("Support Analyst IT", "Our hiring decisions are never based on race, citizenship, or age. IT support incident SLA.")
        self.assertNotIn("Citizenship or PR required", v.reasons)

    def test_clearance_nv2_leidos(self):
        v = run("System Administrator IT", "requires the successful applicant to be an Australian Citizen holding an NV2 Security Clearance. Linux Windows Server VMware.")
        self.assertEqual(v.decision, "SKIP")
        self.assertTrue(any("clearance" in r.lower() for r in v.reasons))

    def test_soft_clearance_is_only_a_flag_scyne_style(self):
        v = run("IT Support Analyst", "Background checks and, if required, valid Commonwealth security clearances are part of our process. IT service desk incident.")
        self.assertEqual(v.decision, "PURSUE"); self.assertTrue(any("security clearance" in f for f in v.flags))

    def test_international_applicants_medhealth(self):
        v = run("Desktop Support Technician", "** We will not be able to support international applicants for this role. IT desktop support Windows Microsoft 365.")
        self.assertIn("International applicants not supported", v.reasons)

    def test_five_plus_years_st_john(self):
        v = run("IT Service Desk Analyst", "5+ years' experience in an IT Support or Service Desk role. For 140 years we have saved lives. Microsoft 365 Azure Intune.")
        self.assertEqual(v.decision, "SKIP"); self.assertEqual(v.years[0], 5)

    def test_seven_years_bss(self):
        self.assertEqual(run("Analyst Programmer", "7 years of professional experience in Java, Spring Boot. software developer IT").decision, "SKIP")

    def test_three_to_five_years_eastlink(self):
        self.assertEqual(run("End User Support IT", "Minimum 3-5 years' experience in an End User Support, Desktop Support role. Windows IT").decision, "SKIP")

    def test_mandarin_essential_cargo(self):
        v = run("Systems Analyst IT", "Business-level proficiency in both English and Mandarin Chinese is essential. SQL Python systems.")
        self.assertIn("Requires a language not on your record", v.reasons)

    def test_closed_pfd(self):
        v = run("IT Service Desk Analyst", "Applications close Monday, 21 September 2026 at 12:00 pm (AEST). IT support service desk incident.")
        self.assertEqual(v.decision, "SKIP"); self.assertTrue(v.reasons[0].startswith("Closed on 21/09/2026"))

    def test_undergraduate_only_cummins(self):
        self.assertIn("Requires undergraduate status", run("2027 Undergraduate IT Internship", "IT internship software").reasons)

    def test_postgraduate_ok(self):
        self.assertNotIn("Requires undergraduate status", run("Graduate IT Internship for undergraduate and postgraduate students", "IT software technology").reasons)

    def test_senior_title(self):
        self.assertIn("Too senior (title)", run("Senior Systems Administrator", "IT systems Windows server Linux VMware").reasons)

    def test_not_it(self):
        self.assertIn("Not an IT role", run("Customer Service Representative", "Answer calls. Retail store.").reasons)
        self.assertIn("Not an IT role", run("Equity Research Analyst", "Research equities and markets.").reasons)

    def test_niche_sap(self):
        self.assertTrue(any("SAP" in r for r in run("SAP Supply Chain Analyst IT", "SAP MM module IT systems").reasons))

    def test_unpaid(self):
        self.assertIn("Unpaid", run("IT Intern", "This is an unpaid internship in IT software.").reasons)


class PursueAndFlags(unittest.TestCase):
    def test_closing_date_shown_bank_australia(self):
        v = run("IT Service Desk Analyst", "Posted: 30/09/2026 Closing Date: 28/10/2026 Job Type: Permanent. 1st and 2nd level IT support Citrix Active Directory Microsoft 365 ITIL.")
        self.assertEqual(v.decision, "PURSUE"); self.assertEqual(v.closing, date(2026, 10, 28))
        self.assertIn("itil", v.gaps)

    def test_missing_closing_date_still_pursued_capgemini(self):
        v = run("Service Desk Analyst", "First point of contact for end-user IT issues, incidents and tickets. Desktop support. ITIL-aligned.")
        self.assertEqual(v.decision, "PURSUE"); self.assertIsNone(v.closing)

    def test_one_to_three_years_ok_russell_kennedy(self):
        v = run("Junior Systems Administrator", "1- 3 years' experience in IT Support, Service Desk. Microsoft 365 Active Directory Windows server.")
        self.assertEqual(v.decision, "PURSUE"); self.assertEqual(v.years[0], 1)

    def test_one_to_two_plus_oroton(self):
        self.assertEqual(run("IT Service Desk Analyst", "1-2+ years helpdesk technician experience. Active Directory Microsoft 365.").decision, "PURSUE")

    def test_min_two_years_is_a_flag_not_skip_estia(self):
        v = run("Service Desk Analyst", "Minimum 2 years experience in a similar IT Service Desk role. Windows Server Office 365.")
        self.assertEqual(v.decision, "PURSUE"); self.assertTrue(any("Minimum 2 years" in f for f in v.flags))

    def test_words_for_numbers_vicroads(self):
        self.assertEqual(years_required("With at least two years' experience in a similar role")[0], 2)

    def test_full_working_rights_flag_synogize(self):
        v = run("Graduate Consultant IT Data", "Applicants must have full working rights in Australia. SQL Snowflake dbt Tableau data.")
        self.assertTrue(any("Student Visa (500)" in f for f in v.flags)); self.assertIn("snowflake", v.gaps)

    def test_sponsorship_future_is_flagged_never_answered(self):
        v = run("IT Support Analyst", "Will you require sponsorship now or in the future? IT service desk incident.")
        self.assertTrue(any("never answered" in f for f in v.flags))

    def test_driver_licence_flag_medical_it(self):
        self.assertTrue(any("driver's licence" in f for f in run("IT Support Administrator", "Current Australian Driver's Licence essential. IT support Microsoft 365 Windows.").flags))

    def test_stale_posting_flag(self):
        v = run("IT Support Officer", "IT service desk Windows Microsoft 365.", posted="2026-07-30")
        self.assertTrue(any("may already be filled" in f for f in v.flags))

    def test_full_time_work_limit_flag(self):
        v = run("IT Support Officer", "IT service desk Windows.", job_type="Full-time")
        self.assertTrue(any("48 hours per fortnight" in f for f in v.flags))

    def test_tiers(self):
        self.assertEqual(run("Graduate Integration Engineer", "IT software integration SQL API").tier, "1")
        self.assertEqual(run("Service Desk Analyst", "IT service desk incident").tier, "2")


if __name__ == "__main__":
    unittest.main()
