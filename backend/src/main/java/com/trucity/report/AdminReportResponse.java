package com.trucity.report;

import java.util.List;

public record AdminReportResponse(

        String period,

        String generatedAt,

        Overview overview,

        UserReport users,

        JobReport jobs,

        ApplicationReport applications,

        VerificationReport verifications,

        List<DailyActivity> dailyActivity

) {


    public record Overview(

            long totalUsers,

            long candidates,

            long employers,

            long jobs,

            long applications,

            long verifications

    ) {
    }


    public record UserReport(

            long newUsers,

            long newCandidates,

            long newEmployers

    ) {
    }


    public record JobReport(

            long total,

            long created,

            long active,

            long pending,

            long closed

    ) {
    }


    public record ApplicationReport(

            long total,

            List<StatusCount> statuses

    ) {
    }


    public record VerificationReport(

            long total,

            List<StatusCount> statuses

    ) {
    }


    public record StatusCount(

            String status,

            long count

    ) {
    }


    public record DailyActivity(

            String date,

            long users,

            long jobs,

            long applications,

            long verifications

    ) {
    }
}