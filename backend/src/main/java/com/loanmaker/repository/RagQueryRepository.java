package com.loanmaker.repository;

import com.loanmaker.model.RagQuery;
import com.loanmaker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RagQueryRepository extends JpaRepository<RagQuery, Long> {
    List<RagQuery> findTop20ByUserOrderByCreatedAtDesc(User user);
}
