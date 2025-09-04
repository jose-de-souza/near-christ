package com.nearchrist.backend.exception;

public class DioceseHasParishesException extends IllegalStateException {
    private final String dioceseName;
    private final int parishCount;

    public DioceseHasParishesException(String dioceseName, int parishCount) {
        super(String.format("The %s has %d parish%s associated to it. If you want to delete this Diocese please delete all of its Parishes first.",
                dioceseName, parishCount, parishCount == 1 ? "" : "es"));
        this.dioceseName = dioceseName;
        this.parishCount = parishCount;
    }

    public String getDioceseName() {
        return dioceseName;
    }

    public int getParishCount() {
        return parishCount;
    }
}