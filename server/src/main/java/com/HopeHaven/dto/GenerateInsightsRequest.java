// package com.HopeHaven.dto;

// import java.util.List;

// public class GenerateInsightsRequest {
//     private List<String> journals;   // plaintext (frontend-decrypted)
//     private String fromDate;         // optional ISO, e.g., "2025-12-01T00:00:00"
//     private String toDate;           // optional ISO

//     public List<String> getJournals() { return journals; }
//     public void setJournals(List<String> journals) { this.journals = journals; }

//     public String getFromDate() { return fromDate; }
//     public void setFromDate(String fromDate) { this.fromDate = fromDate; }

//     public String getToDate() { return toDate; }
//     public void setToDate(String toDate) { this.toDate = toDate; }
// }


package com.HopeHaven.dto;

import java.util.List;

public class GenerateInsightsRequest {

    private List<String> journals;
    private String fromDate;
    private String toDate;

    public List<String> getJournals() {
        return journals;
    }

    public void setJournals(List<String> journals) {
        this.journals = journals;
    }

    public String getFromDate() {
        return fromDate;
    }

    public void setFromDate(String fromDate) {
        this.fromDate = fromDate;
    }

    public String getToDate() {
        return toDate;
    }

    public void setToDate(String toDate) {
        this.toDate = toDate;
    }
}
