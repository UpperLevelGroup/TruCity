package com.trucity.jobs;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JobExpiryScheduler {

    private final JobExpiryService jobExpiryService;

    /**
     * Runs every minute so a post is expired automatically shortly after
     * its application deadline passes.
     */
    @Scheduled(cron = "0 * * * * *")
    public void processExpiredJobs() {
        try {
            int rejected =
                    jobExpiryService.expireJobsAndRejectApplications();

            if (rejected > 0) {
                System.out.println(
                        "Job expiry processor rejected "
                                + rejected
                                + " expired application(s)."
                );
            }
        } catch (Exception exception) {
            System.err.println(
                    "Job expiry processor failed: "
                            + exception.getMessage()
            );
        }
    }
}
