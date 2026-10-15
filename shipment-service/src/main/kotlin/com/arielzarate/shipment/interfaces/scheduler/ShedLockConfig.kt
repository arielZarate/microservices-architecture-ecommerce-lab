package com.arielzarate.shipment.interfaces.scheduler

import net.javacrumbs.shedlock.provider.jdbc.JdbcLockProvider
import net.javacrumbs.shedlock.spring.annotation.EnableSchedulerLock
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.jdbc.core.JdbcTemplate
import javax.sql.DataSource

@Configuration
@EnableSchedulerLock(defaultLockAtMostFor = "PT30S")
class ShedLockConfig {

    @Bean
    fun lockProvider(dataSource: DataSource): JdbcLockProvider {
        val jdbcTemplate = JdbcTemplate(dataSource)
        jdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS shedlock (
                name VARCHAR(64) NOT NULL,
                lock_until TIMESTAMP NOT NULL,
                locked_at TIMESTAMP NOT NULL,
                locked_by VARCHAR(255) NOT NULL,
                PRIMARY KEY (name)
            )
        """)
        return JdbcLockProvider(dataSource)
    }
}
